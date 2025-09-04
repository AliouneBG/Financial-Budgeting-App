const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');

// @route   GET api/categories
// @desc    Get all categories for user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1',
      [req.user.id]
    );
    res.json(categories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/categories
// @desc    Create a category
router.post('/', auth, async (req, res) => {
  const { name, color, budget } = req.body;

  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (user_id, name, color, budget) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, color, budget]
    );
    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/categories/:id
// @desc    Update a category
router.put('/:id', auth, async (req, res) => {
  const { name, color, budget } = req.body;
  const { id } = req.params;

  try {
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, color = $2, budget = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, color, budget, id, req.user.id]
    );
    
    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // First update transactions that reference this category
    await pool.query(
      'UPDATE transactions SET category_id = NULL WHERE category_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    // Then delete the category
    const deletedCategory = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (deletedCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;