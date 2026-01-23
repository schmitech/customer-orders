# Customer Order Data Visualization Dashboard

A full-stack web application for visualizing customer order data with interactive charts and comprehensive data management.

## Features

- **Dashboard Overview**: Key metrics including total orders, revenue, and customer count
- **Interactive Charts**: 
  - Orders over time (line chart)
  - Revenue by customer (bar chart)
  - Order status distribution (pie chart)
- **Data Tables**: Paginated customer and order listings
- **Filtering & Sorting**: Filter by date range, customer, and order status
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Quick Start

For the fastest setup, run the quick start script:

```bash
./quick-start.sh
```

This script will:
- Check prerequisites (Node.js, PostgreSQL)
- Install dependencies
- Create environment file
- Test database connection
- Provide setup instructions

## Manual Setup Instructions

### 1. Database Setup

First, create a PostgreSQL database and run the provided SQL schema:

```bash
# Create database
psql -U postgres
CREATE DATABASE customer_orders;
\q

# Run the schema
psql -U postgres -d customer_orders -f customer-order.sql

# (Optional) Add sample data
psql -U postgres -d customer_orders -f sample-data.sql
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=customer_orders
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   PORT=3001
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

The application will start both frontend and backend servers:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

- `GET /api/dashboard` - Dashboard metrics
- `GET /api/customers` - Customer list with pagination
- `GET /api/orders` - Order list with filtering and pagination
- `GET /api/charts/orders-over-time` - Orders timeline data
- `GET /api/charts/revenue-by-customer` - Revenue by customer data
- `GET /api/charts/order-status` - Order status distribution

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── services/           # API service functions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── backend/
│   ├── db/                 # Database schema and connection
│   ├── routes/             # Express route handlers
│   └── server.js           # Express server setup
├── .env                    # Environment variables
└── README.md
```

## Sample Data

Sample data is provided in `sample-data.sql`. To populate your database:

```bash
psql -U postgres -d customer_orders -f sample-data.sql
```

This will add 10 customers and 30 orders with realistic data for testing the application features.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License