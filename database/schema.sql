-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('admin', 'buyer');
create type transaction_status as enum ('success', 'failed');

-- Create Users table
create table users (
    user_id uuid primary key default uuid_generate_v4(),
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(255) not null,
    phone_number varchar(20),
    role user_role not null default 'buyer',
    fingerprint_data text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create Products table
create table products (
    product_id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null unique,
    description text,
    price decimal(10,2) not null check (price > 0),
    image_url text,
    category varchar(50),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create Transactions table
create table transactions (
    transaction_id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(user_id) on delete restrict,
    total_amount decimal(10,2) not null check (total_amount > 0),
    status transaction_status not null default 'success',
    payment_method varchar(50) default 'fingerprint',
    fingerprint_verified boolean not null default false,
    created_at timestamptz not null default now()
);

-- Create Transaction_Items table
create table transaction_items (
    item_id uuid primary key default uuid_generate_v4(),
    transaction_id uuid not null references transactions(transaction_id) on delete cascade,
    product_id uuid not null references products(product_id) on delete restrict,
    quantity int not null check (quantity > 0),
    unit_price decimal(10,2) not null check (unit_price > 0),
    subtotal decimal(10,2) not null,
    created_at timestamptz not null default now()
);

-- Create System_Logs table
create table system_logs (
    log_id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(user_id) on delete set null,
    action varchar(50) not null,
    message text,
    status varchar(50),
    created_at timestamptz not null default now()
);

-- Create indexes
create index idx_products_category on products(category);
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_created_at on transactions(created_at);
create index idx_transactions_status on transactions(status);
create index idx_transaction_items_transaction_id on transaction_items(transaction_id);
create index idx_transaction_items_product_id on transaction_items(product_id);
create index idx_system_logs_user_id on system_logs(user_id);
create index idx_system_logs_created_at on system_logs(created_at);
create index idx_system_logs_status on system_logs(status);

-- Create updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at();

create trigger update_products_updated_at
    before update on products
    for each row
    execute function update_updated_at();

-- Create function to calculate subtotal
create or replace function calculate_subtotal()
returns trigger as $$
begin
    new.subtotal = new.quantity * new.unit_price;
    return new;
end;
$$ language plpgsql;

-- Create trigger for subtotal calculation
create trigger calculate_transaction_item_subtotal
    before insert or update on transaction_items
    for each row
    execute function calculate_subtotal();

-- Enable Row Level Security
alter table users enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table system_logs enable row level security;

-- Create RLS Policies

-- Users policies
create policy "Users can view their own profile"
    on users for select
    using (auth.uid() = user_id);

create policy "Admins can view all users"
    on users for select
    using (auth.jwt() ->> 'role' = 'admin');

-- Products policies
create policy "Anyone can view products"
    on products for select
    to authenticated
    using (true);

create policy "Only admins can modify products"
    on products for all
    using (auth.jwt() ->> 'role' = 'admin');

-- Transactions policies
create policy "Users can view their own transactions"
    on transactions for select
    using (auth.uid() = user_id);

create policy "Users can create their own transactions"
    on transactions for insert
    with check (auth.uid() = user_id);

create policy "Admins can view all transactions"
    on transactions for select
    using (auth.jwt() ->> 'role' = 'admin');

-- Transaction_Items policies
create policy "Users can view their own transaction items"
    on transaction_items for select
    using (
        exists (
            select 1 from transactions
            where transactions.transaction_id = transaction_items.transaction_id
            and transactions.user_id = auth.uid()
        )
    );

create policy "Users can create their own transaction items"
    on transaction_items for insert
    with check (
        exists (
            select 1 from transactions
            where transactions.transaction_id = transaction_items.transaction_id
            and transactions.user_id = auth.uid()
        )
    );

-- System_Logs policies
create policy "Only admins can view system logs"
    on system_logs for select
    using (auth.jwt() ->> 'role' = 'admin');

-- Create initial admin user (remember to change the password in production)
insert into users (email, password_hash, full_name, role)
values ('admin@fingerpay.com', 'CHANGE_THIS_PASSWORD_HASH', 'System Admin', 'admin');

-- Create sample products
insert into products (name, description, price, category) values
    ('Matcha', 'Premium green tea latte with a smooth, creamy texture', 120.00, 'tea'),
    ('Iced Latte', 'Espresso mixed with cold milk and ice', 125.00, 'coffee'),
    ('Frappe', 'Blended coffee drink topped with whipped cream', 135.00, 'coffee'),
    ('Coffee Jelly', 'Coffee-flavored jelly in sweet cream', 125.00, 'specialty'),
    ('Shade', 'Our signature layered coffee drink', 130.00, 'specialty'),
    ('Caramel', 'Rich coffee with caramel syrup and milk', 125.00, 'coffee'),
    ('Pumpkin Coffee', 'Seasonal coffee with pumpkin spice', 135.00, 'coffee'),
    ('Choco Coffee', 'Coffee blended with premium chocolate', 140.00, 'coffee'); 