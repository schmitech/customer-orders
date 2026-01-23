-- Sample data for Customer Orders Application
-- Run this after setting up the database schema

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, city, country) VALUES
('John Doe', 'john@example.com', '+1234567890', '123 Main St', 'New York', 'USA'),
('Jane Smith', 'jane@example.com', '+1234567891', '456 Oak Ave', 'Los Angeles', 'USA'),
('Bob Johnson', 'bob@example.com', '+1234567892', '789 Pine Rd', 'Chicago', 'USA'),
('Alice Brown', 'alice@example.com', '+1234567893', '321 Elm St', 'Boston', 'USA'),
('Charlie Wilson', 'charlie@example.com', '+1234567894', '654 Maple Dr', 'Seattle', 'USA'),
('Diana Miller', 'diana@example.com', '+1234567895', '987 Cedar Ln', 'Austin', 'USA'),
('Edward Davis', 'edward@example.com', '+1234567896', '456 Birch Way', 'Denver', 'USA'),
('Fiona Garcia', 'fiona@example.com', '+1234567897', '789 Spruce St', 'Miami', 'USA'),
('George Martinez', 'george@example.com', '+1234567898', '321 Willow Ave', 'Phoenix', 'USA'),
('Helen Rodriguez', 'helen@example.com', '+1234567899', '654 Aspen Rd', 'Portland', 'USA');

-- Insert sample orders
INSERT INTO orders (customer_id, order_date, total, status, shipping_address, payment_method) VALUES
(1, '2024-01-15', 299.99, 'completed', '123 Main St, New York', 'credit_card'),
(2, '2024-01-16', 149.50, 'pending', '456 Oak Ave, Los Angeles', 'paypal'),
(1, '2024-01-17', 89.99, 'shipped', '123 Main St, New York', 'credit_card'),
(3, '2024-01-18', 199.99, 'completed', '789 Pine Rd, Chicago', 'debit_card'),
(4, '2024-01-19', 399.99, 'completed', '321 Elm St, Boston', 'credit_card'),
(5, '2024-01-20', 79.99, 'pending', '654 Maple Dr, Seattle', 'paypal'),
(2, '2024-01-21', 249.99, 'shipped', '456 Oak Ave, Los Angeles', 'credit_card'),
(1, '2024-01-22', 159.99, 'completed', '123 Main St, New York', 'debit_card'),
(6, '2024-01-23', 129.99, 'completed', '987 Cedar Ln, Austin', 'credit_card'),
(7, '2024-01-24', 89.99, 'pending', '456 Birch Way, Denver', 'paypal'),
(8, '2024-01-25', 349.99, 'shipped', '789 Spruce St, Miami', 'credit_card'),
(9, '2024-01-26', 199.99, 'completed', '321 Willow Ave, Phoenix', 'debit_card'),
(10, '2024-01-27', 179.99, 'completed', '654 Aspen Rd, Portland', 'credit_card'),
(3, '2024-01-28', 99.99, 'pending', '789 Pine Rd, Chicago', 'paypal'),
(4, '2024-01-29', 259.99, 'shipped', '321 Elm St, Boston', 'credit_card'),
(5, '2024-01-30', 189.99, 'completed', '654 Maple Dr, Seattle', 'debit_card'),
(6, '2024-01-31', 139.99, 'completed', '987 Cedar Ln, Austin', 'credit_card'),
(7, '2024-02-01', 299.99, 'pending', '456 Birch Way, Denver', 'paypal'),
(8, '2024-02-02', 159.99, 'shipped', '789 Spruce St, Miami', 'credit_card'),
(9, '2024-02-03', 229.99, 'completed', '321 Willow Ave, Phoenix', 'debit_card'),
(10, '2024-02-04', 279.99, 'completed', '654 Aspen Rd, Portland', 'credit_card'),
(1, '2024-02-05', 119.99, 'pending', '123 Main St, New York', 'paypal'),
(2, '2024-02-06', 189.99, 'shipped', '456 Oak Ave, Los Angeles', 'credit_card'),
(3, '2024-02-07', 349.99, 'completed', '789 Pine Rd, Chicago', 'debit_card'),
(4, '2024-02-08', 99.99, 'completed', '321 Elm St, Boston', 'credit_card'),
(5, '2024-02-09', 269.99, 'pending', '654 Maple Dr, Seattle', 'paypal'),
(6, '2024-02-10', 149.99, 'shipped', '987 Cedar Ln, Austin', 'credit_card'),
(7, '2024-02-11', 199.99, 'completed', '456 Birch Way, Denver', 'debit_card'),
(8, '2024-02-12', 319.99, 'completed', '789 Spruce St, Miami', 'credit_card'),
(9, '2024-02-13', 89.99, 'pending', '321 Willow Ave, Phoenix', 'paypal'),
(10, '2024-02-14', 239.99, 'shipped', '654 Aspen Rd, Portland', 'credit_card');

-- Verify the data
SELECT 
    'customers' as table_name,
    COUNT(*) as record_count
FROM customers
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as record_count
FROM orders; 