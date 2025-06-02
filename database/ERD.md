# FingerPay Database Schema

## Entities and Relationships

### Users

- user_id (PK)
- email
- password_hash
- full_name
- phone_number
- role (admin/buyer)
- fingerprint_data
- created_at
- updated_at

### Products

- product_id (PK)
- name
- description
- price
- image_url
- category
- created_at
- updated_at

### Transactions

- transaction_id (PK)
- user_id (FK)
- total_amount
- status (success/failed)
- payment_method
- fingerprint_verified
- created_at

### Transaction_Items

- item_id (PK)
- transaction_id (FK)
- product_id (FK)
- quantity
- unit_price
- subtotal
- created_at

### System_Logs

- log_id (PK)
- user_id (FK)
- action
- message
- status
- created_at

## Relationships

1. Users to Transactions (1:N)

   - One user can have many transactions
   - Each transaction belongs to one user

2. Transactions to Transaction_Items (1:N)

   - One transaction can have many items
   - Each item belongs to one transaction

3. Products to Transaction_Items (1:N)

   - One product can be in many transaction items
   - Each transaction item refers to one product

4. Users to System_Logs (1:N)
   - One user can have many system logs
   - Each system log belongs to one user

## Constraints

### Users

- email must be unique
- password_hash must not be null
- role must be either 'admin' or 'buyer'

### Products

- price must be positive
- name must be unique

### Transactions

- total_amount must be positive
- status must be either 'success' or 'failed'

### Transaction_Items

- quantity must be positive
- unit_price must be positive
- subtotal must equal quantity \* unit_price

## Indexes

1. Users

   - email (unique)
   - fingerprint_data (unique)

2. Products

   - name
   - category

3. Transactions

   - user_id
   - created_at
   - status

4. Transaction_Items

   - transaction_id
   - product_id

5. System_Logs
   - user_id
   - created_at
   - status
