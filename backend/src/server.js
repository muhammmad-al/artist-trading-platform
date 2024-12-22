const express = require('express');
const cors = require('cors');
require('dotenv').config();
const artistRoutes = require('./routes/artists');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/artists', artistRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});