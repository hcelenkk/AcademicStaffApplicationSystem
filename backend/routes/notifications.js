const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/db');

// Bildirimleri Getirme (Aday)
router.get('/', authMiddleware, async (req, res) => {
  const tc_kimlik = req.user.tc_kimlik;

  try {
    const query = `
      SELECT * FROM bildirim
      WHERE tc_kimlik = $1
      ORDER BY tarih DESC`;
    const result = await pool.query(query, [tc_kimlik]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Bildirim getirme hatası:', err.message);
    res.status(500).json({ message: 'Bildirimler getirilemedi' });
  }
});

// Bildirimi Okundu Olarak İşaretleme (Aday)
router.put('/:bildirim_id/read', authMiddleware, async (req, res) => {
  const { bildirim_id } = req.params;
  const tc_kimlik = req.user.tc_kimlik;

  try {
    const query = `
      UPDATE bildirim
      SET okundu = true
      WHERE bildirim_id = $1 AND tc_kimlik = $2 RETURNING *`;
    const result = await pool.query(query, [bildirim_id, tc_kimlik]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Bildirim bulunamadı veya size ait değil' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Bildirim güncelleme hatası:', err.message);
    res.status(500).json({ message: 'Bildirim okundu olarak işaretlenemedi' });
  }
});

module.exports = router;