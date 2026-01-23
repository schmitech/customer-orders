# Customer Orders Application Setup Guide

This guide will help you set up the Customer Orders application with the provided SQL schema.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE customer_orders;

# Connect to the new database
\c customer_orders
```

### 1.2 Run the SQL Schema

The application uses the schema defined in `customer-order.sql`. This schema creates:

- **customers** table with fields: id, name, email, phone, address, city, country, created_at, updated_at
- **orders** table with fields: id, customer_id, order_date, total, status, shipping_address, payment_method, created_at, updated_at
- Proper foreign key relationships
- Indexes for performance
- Triggers for automatic updated_at timestamps

```bash
# Run the schema
psql -U postgres -d customer_orders -f customer-order.sql
```

## Step 2: Environment Configuration

### 2.1 Create Environment File

Copy the example environment file:
```bash
cp env.example .env
```

### 2.2 Configure Database Connection

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=customer_orders
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
```

**Important**: Replace `your_password_here` with your actual PostgreSQL password.

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start the Application

### 4.1 Start Backend Server

```bash
npm run dev:server
```

This will start the Express server on port 3001.

### 4.2 Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

This will start the React development server on port 5173.

### 4.3 Start Both Servers Together

```bash
npm run dev:full
```

This command starts both frontend and backend servers concurrently.

## Step 5: Verify Setup

### 5.1 Check Backend Health

Visit: http://localhost:3001/api/health

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX..."
}
```

### 5.2 Check Frontend

Visit: http://localhost:5173

You should see the Customer Order Dashboard with:
- Dashboard metrics
- Navigation tabs
- Charts and data tables

## Step 6: Add Sample Data (Optional)

To test the application with sample data, run these SQL commands in your database:

```sql
-- Insert sample customers
INSERT INTO customers (name, email, phone, address, city, country) VALUES
('John Doe', 'john@example.com', '+1234567890', '123 Main St', 'New York', 'USA'),
('Jane Smith', 'jane@example.com', '+1234567891', '456 Oak Ave', 'Los Angeles', 'USA'),
('Bob Johnson', 'bob@example.com', '+1234567892', '789 Pine Rd', 'Chicago', 'USA'),
('Alice Brown', 'alice@example.com', '+1234567893', '321 Elm St', 'Boston', 'USA'),
('Charlie Wilson', 'charlie@example.com', '+1234567894', '654 Maple Dr', 'Seattle', 'USA');

-- Insert sample orders
INSERT INTO orders (customer_id, order_date, total, status, shipping_address, payment_method) VALUES
(1, '2024-01-15', 299.99, 'completed', '123 Main St, New York', 'credit_card'),
(2, '2024-01-16', 149.50, 'pending', '456 Oak Ave, Los Angeles', 'paypal'),
(1, '2024-01-17', 89.99, 'shipped', '123 Main St, New York', 'credit_card'),
(3, '2024-01-18', 199.99, 'completed', '789 Pine Rd, Chicago', 'debit_card'),
(4, '2024-01-19', 399.99, 'completed', '321 Elm St, Boston', 'credit_card'),
(5, '2024-01-20', 79.99, 'pending', '654 Maple Dr, Seattle', 'paypal'),
(2, '2024-01-21', 249.99, 'shipped', '456 Oak Ave, Los Angeles', 'credit_card'),
(1, '2024-01-22', 159.99, 'completed', '123 Main St, New York', 'debit_card');
```

## Troubleshooting

### Database Connection Issues

1. **Connection refused**: Make sure PostgreSQL is running
2. **Authentication failed**: Check your username and password in `.env`
3. **Database does not exist**: Create the database first

### Port Already in Use

If port 3001 is already in use, change the PORT in your `.env` file and update the API_BASE_URL in `src/services/api.ts`.

### CORS Issues

The backend is configured with CORS to allow requests from the frontend. If you change ports, update the CORS configuration in `backend/server.cjs`.

## Application Features

Once set up, the application provides:

- **Dashboard**: Overview metrics (total orders, revenue, customers, pending orders)
- **Charts**: Interactive visualizations of order data
- **Customers**: Paginated customer list with search functionality
- **Orders**: Filterable order list with date range and status filtering

## API Endpoints

- `GET /api/dashboard` - Dashboard metrics
- `GET /api/customers` - Customer list with pagination and search
- `GET /api/orders` - Order list with filtering and pagination
- `GET /api/charts/orders-over-time` - Orders timeline data
- `GET /api/charts/revenue-by-customer` - Revenue by customer data
- `GET /api/charts/order-status` - Order status distribution

## Database Schema

The application uses a simple but effective schema:

**customers table:**
- Primary key: id
- Fields: name, email, phone, address, city, country
- Timestamps: created_at, updated_at

**orders table:**
- Primary key: id
- Foreign key: customer_id (references customers.id)
- Fields: order_date, total, status, shipping_address, payment_method
- Timestamps: created_at, updated_at

The schema includes proper indexes and triggers for optimal performance. 