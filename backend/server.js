const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL bağlantısı için gerekli

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL bağlantısı için Pool oluşturuluyor
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Orta katmanlar
app.use(cors());
app.use(express.json());

// Ana rotada basit bir mesaj döndürüyoruz
app.get('/', (req, res) => {
  res.send('Akademik Portal Backend Çalışıyor!');
});

// PostgreSQL'den veri çekme işlemi örneği
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');  // Veritabanından geçerli zamanı sorguluyoruz
    res.json(result.rows);  // Sorgu sonucunu JSON formatında dönüyoruz
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
  }
});

// Sunucuyu dinlemeye başlıyoruz
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
