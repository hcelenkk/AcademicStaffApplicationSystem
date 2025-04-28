// routes/users.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Kullanıcıları Getirme (Filtreleme ile, Yönetici, Jüri ve Admin için)
router.get('/', authMiddleware, roleMiddleware(['Yönetici', 'Jüri', 'Admin']), async (req, res) => {
  const { rol } = req.query;

  try {
    let query = 'SELECT tc_kimlik, ad, soyad, eposta, rol FROM kullanici';
    const values = [];
    if (rol) {
      query += ' WHERE rol = $1';
      values.push(rol);
    }
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', {
      error: err.message,
      stack: err.stack,
      queryParams: req.query,
    });
    res.status(500).json({ message: 'Kullanıcılar getirilemedi.', error: err.message });
  }
});

// Kullanıcı Rolünü Güncelleme (Yalnızca Admin için)
router.put('/:tc_kimlik/role', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { tc_kimlik } = req.params;
  const { rol } = req.body;

  try {
    const result = await pool.query(
      'UPDATE kullanici SET rol = $1, son_guncelleme = NOW() WHERE tc_kimlik = $2 RETURNING *',
      [rol, tc_kimlik]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Rol güncelleme hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik,
      rol,
    });
    res.status(500).json({ message: 'Rol güncellenemedi.', error: err.message });
  }
});

module.exports = router;