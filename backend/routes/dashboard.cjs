const express = require('express');
const { pool } = require('../db/connection.cjs');
const router = express.Router();

// Get dashboard metrics
router.get('/', async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as total_orders FROM orders',
      'SELECT COUNT(*) as total_customers FROM customers',
      'SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE status IN ($1, $2)',
      'SELECT COUNT(*) as pending_orders FROM orders WHERE status = $1'
    ];

    const [ordersResult, customersResult, revenueResult, pendingResult] = await Promise.all([
      pool.query(queries[0]),
      pool.query(queries[1]),
      pool.query(queries[2], ['completed', 'shipped']),
      pool.query(queries[3], ['pending'])
    ]);

    const metrics = {
      totalOrders: parseInt(ordersResult.rows[0].total_orders),
      totalCustomers: parseInt(customersResult.rows[0].total_customers),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      pendingOrders: parseInt(pendingResult.rows[0].pending_orders)
    };

    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get revenue breakdown by status
router.get('/revenue-breakdown', async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as total_revenue
      FROM orders 
      GROUP BY status 
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown' });
  }
});

module.exports = router;