const express = require('express');
const router = express.Router();
const blockchainService = require('../../services/blockchain');

// Get all tokens
router.get('/', async (req, res) => {
    try {
        const result = await blockchainService.getAllTokens();
        if (result.success) {
            res.json(result.tokens);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get token price
router.get('/:address/price', async (req, res) => {
    try {
        const result = await blockchainService.getTokenPrice(req.params.address);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add liquidity
router.post('/:address/liquidity', async (req, res) => {
    try {
        const { ethAmount } = req.body;
        const result = await blockchainService.addLiquidity(req.params.address, ethAmount);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error adding liquidity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Buy tokens
router.post('/:address/buy', async (req, res) => {
    try {
        const { ethAmount, minTokens } = req.body;
        const result = await blockchainService.buyTokens(
            req.params.address,
            ethAmount,
            minTokens
        );
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error buying tokens:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sell tokens
router.post('/:address/sell', async (req, res) => {
    try {
        const { tokenAmount, minEth } = req.body;
        const result = await blockchainService.sellTokens(
            req.params.address,
            tokenAmount,
            minEth
        );
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error selling tokens:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;