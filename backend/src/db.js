const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'muhammadal-atrash',   
    host: 'localhost',
    database: 'artist_platform',
    password: '',                  
    port: 5432
});

module.exports = pool;