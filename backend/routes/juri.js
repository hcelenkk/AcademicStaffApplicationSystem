const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Jüriye Atanmış Başvuruları Getirme (Jüri)
router.get('/applications', authMiddleware, roleMiddleware(['Jüri']), async (req, res) => {
  const tc_kimlik = req.user.tc_kimlik;

  try {
    const query = `
      SELECT b.basvuru_id, b.durum, b.olusturulma_tarih, i.kategori, i.aciklama, k.ad, k.soyad
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      JOIN kullanici k ON b.tc_kimlik = k.tc_kimlik
      JOIN juri_degerlendirme jd ON b.basvuru_id = jd.basvuru_id
      WHERE jd.tc_kimlik = $1`;
    const result = await pool.query(query, [tc_kimlik]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Başvuru getirme hatası:', err.message);
    res.status(500).json({ message: 'Başvurular getirilemedi' });
  }
});

// Başvuruya Ait Belgeleri Getirme (Jüri)
router.get('/application/:basvuru_id/documents', authMiddleware, roleMiddleware(['Jüri']), async (req, res) => {
  const { basvuru_id } = req.params;

  try {
    const query = 'SELECT * FROM belge WHERE basvuru_id = $1';
    const result = await pool.query(query, [basvuru_id]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Belge getirme hatası:', err.message);
    res.status(500).json({ message: 'Belgeler getirilemedi' });
  }
});

// Değerlendirme Yapma (Jüri)
router.post('/evaluation', authMiddleware, roleMiddleware(['Jüri']), async (req, res) => {
  const { basvuru_id, rapor, sonuc } = req.body;
  const tc_kimlik = req.user.tc_kimlik;

  // Sonuç değerini doğrula
  const validResults = ['Kabul Edildi', 'Reddedildi'];
  if (!validResults.includes(sonuc)) {
    return res.status(400).json({ message: `Geçersiz sonuç değeri: ${sonuc}. Geçerli değerler: ${validResults.join(', ')}` });
  }

  try {
    const query = `
      UPDATE juri_degerlendirme
      SET rapor = $1, sonuc = $2, tarih = NOW()
      WHERE tc_kimlik = $3 AND basvuru_id = $4 RETURNING *`;
    const values = [rapor, sonuc, tc_kimlik, basvuru_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Değerlendirme kaydı bulunamadı' });
    }

    // Başvuru durumunu güncelle
    await pool.query('UPDATE basvuru SET durum = $1 WHERE basvuru_id = $2', [sonuc, basvuru_id]);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Değerlendirme hatası:', err.message);
    res.status(500).json({ message: 'Değerlendirme kaydedilemedi' });
  }
});

module.exports = router;