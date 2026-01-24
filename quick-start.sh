#!/bin/bash

# Customer Orders Application - Quick Start Script
# This script helps you set up the application quickly

echo "🚀 Customer Orders Application - Quick Start"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Using existing .env.local file"

# Database setup instructions
echo ""
echo "🗄️  Database Setup Instructions:"
echo "Since you're using AWS RDS, you'll need to:"
echo ""
echo "1. Connect to your RDS instance and run the schema:"
echo "   psql -h YOUR_RDS_ENDPOINT -U YOUR_USERNAME -d YOUR_DATABASE -f customer-order.sql"
echo ""
echo "2. (Optional) Add sample data:"
echo "   psql -h YOUR_RDS_ENDPOINT -U YOUR_USERNAME -d YOUR_DATABASE -f sample-data.sql"
echo ""
echo "Make sure your .env.local file has the correct RDS connection details:"
echo "  DB_HOST=your-rds-endpoint.region.rds.amazonaws.com"
echo "  DB_PORT=5432"
echo "  DB_NAME=your_database_name"
echo "  DB_USER=your_username"
echo "  DB_PASSWORD=your_password"
echo ""

read -p "Press Enter after you've set up the database..."

# Test database connection
echo "🔍 Testing database connection..."
if node -e "
// Create a clean environment by starting fresh
const fs = require('fs');
const path = require('path');

// Read .env.local from project root (process.cwd; __dirname can be undefined in node -e)
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Parse .env.local file manually
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

// Set environment variables directly
process.env.DB_HOST = envVars.DB_HOST;
process.env.DB_PORT = envVars.DB_PORT;
process.env.DB_NAME = envVars.DB_NAME;
process.env.DB_USER = envVars.DB_USER;
process.env.DB_PASSWORD = envVars.DB_PASSWORD;

console.log('🔧 Loaded environment variables:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_NAME:', process.env.DB_NAME);

const { pool } = require('./backend/db/connection.cjs');
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    if (err.code) console.error('   Error code:', err.code);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful');
    pool.end();
  }
});
"; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your .env.local configuration."
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now start the application:"
echo ""
echo "Start both frontend and backend:"
echo "  npm run dev:full"
echo ""
echo "Or start them separately:"
echo "  Backend:  npm run dev:server"
echo "  Frontend: npm run dev"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/api/health"
echo ""
echo "📚 For detailed setup instructions, see setup.md" 