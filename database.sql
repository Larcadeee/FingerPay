-- Update RLS policies for the users table

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on users;
drop policy if exists "Admins can view all users" on users;

-- Create new policies
create policy "Users can view and update their own profile"
    on users for all
    using (
        auth.uid()::text = (
            select u.user_id::text 
            from users u 
            where u.email = auth.jwt() ->> 'email'
        )
    );

create policy "Users can query by email"
    on users for select
    using (true);

create policy "Admins can manage all users"
    on users for all
    using (
        exists (
            select 1 
            from users u 
            where u.email = auth.jwt() ->> 'email' 
            and u.role = 'admin'
        )
    );

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Function to get UUID from auth.uid()
create or replace function get_auth_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()::uuid;
$$;

-- Create the admin user in the auth.users table first (if not exists)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@fingerpay.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
where not exists (
  select 1 from auth.users where email = 'admin@fingerpay.com'
)
returning id;

-- Create the admin user in our users table
insert into users (
    user_id,
    email,
    password_hash,
    full_name,
    role
)
select
    au.id,
    'admin@fingerpay.com',
    au.encrypted_password,
    'System Admin',
    'admin'
from auth.users au
where au.email = 'admin@fingerpay.com'
and not exists (
    select 1 from users where email = 'admin@fingerpay.com'
);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated; 