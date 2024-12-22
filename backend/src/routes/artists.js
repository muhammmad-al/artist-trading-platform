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
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;