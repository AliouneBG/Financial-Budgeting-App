const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');

// @route   GET api/transactions
// @desc    Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await pool.query(
      `SELECT t.*, c.name AS category 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1`,
      [req.user.id]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/transactions
// @desc    Create a transaction
router.post('/', auth, async (req, res) => {
  const { date, merchant, amount, category_id, description, recurrence, next_occurrence } = req.body;

  try {
    const newTransaction = await pool.query(
      `INSERT INTO transactions 
      (user_id, date, merchant, amount, category_id, description, recurrence, next_occurrence) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, date, merchant, amount, category_id, description, recurrence, next_occurrence]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/transactions/:id
// @desc    Update a transaction
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    // Get current transaction
    const currentTx = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (currentTx.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Merge updates with current data
    const updatedData = {
      ...currentTx.rows[0],
      ...updateFields
    };
    
    const { date, merchant, amount, category_id, description, recurrence, next_occurrence } = updatedData;
    
    const updatedTransaction = await pool.query(
      `UPDATE transactions 
      SET date = $1, merchant = $2, amount = $3, category_id = $4, 
          description = $5, recurrence = $6, next_occurrence = $7 
      WHERE id = $8 AND user_id = $9 RETURNING *`,
      [date, merchant, amount, category_id, description, 
       recurrence, next_occurrence, id, req.user.id]
    );
    
    res.json(updatedTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTransaction = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (deletedTransaction.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/transactions
// @desc    Delete all transactions for user
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM transactions WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;