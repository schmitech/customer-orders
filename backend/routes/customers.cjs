const express = require('express');
const { pool } = require('../db/connection.cjs');
const router = express.Router();

// Get customers with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT c.*, 
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total), 0) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM customers c';
    let queryParams = [];
    let countParams = [];

    if (search) {
      query += ' WHERE c.name ILIKE $1 OR c.email ILIKE $1';
      countQuery += ' WHERE c.name ILIKE $1 OR c.email ILIKE $1';
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const [customersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      customers: customersResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;