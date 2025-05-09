const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect((err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.stack);
  } else {
    console.log('Veritabanına başarıyla bağlandı!');
  }
});

module.exports = pool;