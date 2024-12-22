const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all artists
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM artists ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single artist
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM artists WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new artist
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO artists (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        // Check for unique violation on name
        if (err.code === '23505') {  // PostgreSQL unique violation code
            return res.status(400).json({ error: 'Artist name must be unique' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update artist
router.put('/:id', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE artists SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        // Check for unique violation on name
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Artist name must be unique' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete artist
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM artists WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json({ message: 'Artist deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;