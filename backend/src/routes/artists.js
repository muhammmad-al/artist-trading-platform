const express = require('express');
const router = express.Router();
const db = require('../db');
const blockchainService = require('../../services/blockchain');

// Get all artists
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM artists ORDER BY created_at DESC');
        
        // Add blockchain data
        const artistsWithTokens = await Promise.all(
            result.rows.map(async (artist) => {
                if (artist.token_address) {
                    const tokenInfo = await blockchainService.getTokenInfo(artist.token_address);
                    return { ...artist, tokenInfo: tokenInfo.success ? tokenInfo.info : null };
                }
                return artist;
            })
        );
        
        res.json(artistsWithTokens);
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

        const artist = result.rows[0];
        if (artist.token_address) {
            const tokenInfo = await blockchainService.getTokenInfo(artist.token_address);
            artist.tokenInfo = tokenInfo.success ? tokenInfo.info : null;
        }

        res.json(artist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new artist with token
router.post('/', async (req, res) => {
    const { name, description, tokenSymbol, initialSupply } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Create token on blockchain
        const tokenResult = await blockchainService.createToken(
            `${name} Token`,
            tokenSymbol,
            initialSupply
        );

        if (!tokenResult.success) {
            throw new Error(`Token creation failed: ${tokenResult.error}`);
        }

        // Create artist in database
        const result = await client.query(
            'INSERT INTO artists (name, description, token_address) VALUES ($1, $2, $3) RETURNING *',
            [name, description, tokenResult.tokenAddress]
        );

        await client.query('COMMIT');
        
        const artist = result.rows[0];
        const tokenInfo = await blockchainService.getTokenInfo(tokenResult.tokenAddress);
        artist.tokenInfo = tokenInfo.success ? tokenInfo.info : null;
        
        res.json(artist);
    } catch (err) {
        await client.query('ROLLBACK');
        
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Artist name must be unique' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
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

        const artist = result.rows[0];
        if (artist.token_address) {
            const tokenInfo = await blockchainService.getTokenInfo(artist.token_address);
            artist.tokenInfo = tokenInfo.success ? tokenInfo.info : null;
        }

        res.json(artist);
    } catch (err) {
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