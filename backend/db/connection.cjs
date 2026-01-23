const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Clear any existing database environment variables
delete process.env.DB_HOST;
delete process.env.DB_PORT;
delete process.env.DB_NAME;
delete process.env.DB_USER;
delete process.env.DB_PASSWORD;

// Read .env.local file directly
const envPath = path.join(__dirname, '../../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
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

console.log('🔧 Database connection using:');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  Database:', process.env.DB_NAME);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10, // Reduced from 20 for demo app
  min: 2,  // Keep minimum connections ready
  idleTimeoutMillis: 10000, // Reduced to 10 seconds
  connectionTimeoutMillis: 2000,
  acquireTimeoutMillis: 5000, // Timeout for acquiring connections
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit immediately, try to close pool gracefully
  gracefulShutdown();
});

// Graceful shutdown function
async function gracefulShutdown() {
  console.log('🔄 Shutting down database connections gracefully...');
  try {
    await pool.end();
    console.log('✅ Database connections closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing database connections:', err);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon restarts

// Export both pool and shutdown function
module.exports = { pool, gracefulShutdown };