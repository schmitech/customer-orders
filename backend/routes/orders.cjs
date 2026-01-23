const express = require('express');
const { pool } = require('../db/connection.cjs');
const router = express.Router();

// Get orders with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const customerId = req.query.customer_id || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    let query = `
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*)
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;

    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      countQuery += ` AND o.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (customerId) {
      query += ` AND o.customer_id = $${paramIndex}`;
      countQuery += ` AND o.customer_id = $${paramIndex}`;
      queryParams.push(customerId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND o.order_date >= $${paramIndex}`;
      countQuery += ` AND o.order_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND o.order_date <= $${paramIndex}`;
      countQuery += ` AND o.order_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const [ordersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      orders: ordersResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;