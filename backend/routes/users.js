const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Kullanıcıları Getirme (Filtreleme ile, Yönetici ve Jüri için)
router.get('/', authMiddleware, roleMiddleware(['Yönetici', 'Jüri']), async (req, res) => {
  const { rol } = req.query;

  try {
    let query = 'SELECT * FROM kullanici';
    const values = [];
    if (rol) {
      query += ' WHERE rol = $1';
      values.push(rol);
    }
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', err.message);
    res.status(500).json({ message: 'Kullanıcılar getirilemedi' });
  }
});

module.exports = router;