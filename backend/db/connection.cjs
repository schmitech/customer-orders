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
    const k = (key && key.trim());
    if (k && valueParts.length > 0) {
      envVars[k] = valueParts.join('=').trim();
    }
  }
});

// Helper to strip surrounding quotes from .env values
function stripQuotes(s) {
  if (typeof s !== 'string') return s;
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

// Set environment variables directly
process.env.DB_HOST = stripQuotes(envVars.DB_HOST);
process.env.DB_PORT = stripQuotes(envVars.DB_PORT);
process.env.DB_NAME = stripQuotes(envVars.DB_NAME);
process.env.DB_USER = stripQuotes(envVars.DB_USER);
process.env.DB_PASSWORD = stripQuotes(envVars.DB_PASSWORD);
process.env.DB_SSL_MODE = stripQuotes(envVars.DB_SSL_MODE);
process.env.DB_SSL_REJECT_UNAUTHORIZED = stripQuotes(envVars.DB_SSL_REJECT_UNAUTHORIZED);

console.log('🔧 Database connection using:');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  Database:', process.env.DB_NAME);

// AWS RDS and most remote Postgres require SSL. Use SSL when not connecting to localhost.
const isLocalHost = /^localhost$|^127\.0\.0\.1$/.test((process.env.DB_HOST || '').trim());
const sslDisabled = (process.env.DB_SSL_MODE || '').toLowerCase() === 'disable';
const useSsl = !sslDisabled && !isLocalHost;
// RDS often fails with rejectUnauthorized:true if the RDS CA isn't in Node's trust store.
const sslRejectUnauthorized = (process.env.DB_SSL_REJECT_UNAUTHORIZED || 'false').toLowerCase() === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSsl ? { rejectUnauthorized: sslRejectUnauthorized } : false,
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