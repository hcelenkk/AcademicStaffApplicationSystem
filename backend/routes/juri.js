const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Jüri üyesinin değerlendirmesi gereken başvuruları listeleme
router.get('/basvurular', authMiddleware, roleMiddleware(['Juri']), async (req, res) => {
  const juri_tc = req.user.tc_kimlik;
  try {
    const query = `
      SELECT b.basvuru_id, b.durum, b.olusturulma_tarih, b.puan, i.ilan_id, i.kategori, i.aciklama,
             k.ad, k.soyad
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      JOIN kullanici k ON b.tc_kimlik = k.tc_kimlik
      JOIN basvuru_juri bj ON b.basvuru_id = bj.basvuru_id
      WHERE bj.juri_tc = $1
    `;
    const result = await pool.query(query, [juri_tc]);
    res.json(
      result.rows.map((row) => ({
        basvuru_id: row.basvuru_id,
        durum: row.durum,
        basvuru_tarih: row.olusturulma_tarih,
        puan: row.puan,
        aday: { ad: row.ad, soyad: row.soyad },
        ilan: { ilan_id: row.ilan_id, kategori: row.kategori, aciklama: row.aciklama },
      }))
    );
  } catch (err) {
    console.error('Başvurular getirilemedi:', err);
    res.status(500).json({ message: 'Başvurular getirilemedi', error: err.message });
  }
});

// Başvurunun belgelerini görüntüleme
router.get('/basvuru/:id/belgeler', authMiddleware, roleMiddleware(['Juri']), async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM belge WHERE basvuru_id = $1';
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Belgeler getirilemedi:', err);
    res.status(500).json({ message: 'Belgeler getirilemedi', error: err.message });
  }
});

// Değerlendirme raporu yükleme ve değerlendirme yapma
router.post('/degerlendirme', authMiddleware, roleMiddleware(['Juri']), async (req, res) => {
  const { basvuru_id, rapor_dosyasi, sonuc } = req.body;
  const juri_tc = req.user.tc_kimlik;
  try {
    const query = `
      INSERT INTO juri_degerlendirme (juri_tc, basvuru_id, rapor_dosyasi, sonuc, tarih)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *
    `;
    const result = await pool.query(query, [juri_tc, basvuru_id, rapor_dosyasi, sonuc]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Değerlendirme eklenemedi:', err);
    res.status(400).json({ message: 'Değerlendirme eklenemedi', error: err.message });
  }
});

module.exports = router;