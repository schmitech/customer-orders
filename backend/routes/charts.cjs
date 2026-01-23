const express = require('express');
const { pool } = require('../db/connection.cjs');
const router = express.Router();

// Orders over time
router.get('/orders-over-time', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const query = `
      SELECT 
        DATE(order_date) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders 
      WHERE order_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(order_date)
      ORDER BY date ASC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Orders over time error:', error);
    res.status(500).json({ error: 'Failed to fetch orders over time data' });
  }
});

// Revenue by customer
router.get('/revenue-by-customer', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const query = `
      SELECT 
        c.name,
        SUM(o.total) as total_revenue,
        COUNT(o.id) as order_count
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.status = 'completed'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Revenue by customer error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue by customer data' });
  }
});

// Order status distribution
router.get('/order-status', async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total) as total_value
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: 'Failed to fetch order status data' });
  }
});

module.exports = router;