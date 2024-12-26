const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'muhammadal-atrash',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'artist_platform',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432
});

// Add event listener for errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;