const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Kullanıcıları listeleme (rol bazında)
router.get('/', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { rol } = req.query;
  try {
    const query = 'SELECT * FROM kullanici WHERE rol = $1';
    const result = await pool.query(query, [rol]);
    res.json(result.rows);
  } catch (err) {
    console.error('Kullanıcılar getirilemedi:', err);
    res.status(500).json({ message: 'Kullanıcılar getirilemedi', error: err.message });
  }
});

module.exports = router;