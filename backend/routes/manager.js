const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Kadro kriterlerini listeleme
router.get('/kriterler', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  try {
    const query = 'SELECT * FROM kriter'; // kadro_kriterleri yerine kriter tablosunu kullanıyoruz
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Kriterler getirilemedi:', err);
    res.status(500).json({ message: 'Kriterler getirilemedi', error: err.message });
  }
});

// Yeni kadro kriteri ekleme
router.post('/kriterler', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { kategori, aciklama, min_puan, max_puan, aktif } = req.body;
  try {
    const query = `
      INSERT INTO kriter (kategori, aciklama, min_puan, max_puan, aktif)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(query, [kategori, aciklama, min_puan, max_puan, aktif || true]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Kriter eklenemedi:', err);
    res.status(400).json({ message: 'Kriter eklenemedi', error: err.message });
  }
});

// Kadro kriterini güncelleme
router.put('/kriterler/:id', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { id } = req.params;
  const { kategori, aciklama, min_puan, max_puan, aktif } = req.body;
  try {
    const query = `
      UPDATE kriter
      SET kategori = $1, aciklama = $2, min_puan = $3, max_puan = $4, aktif = $5
      WHERE kriter_id = $6 RETURNING *
    `;
    const result = await pool.query(query, [kategori, aciklama, min_puan, max_puan, aktif, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Kriter bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kriter güncellenemedi:', err);
    res.status(400).json({ message: 'Kriter güncellenemedi', error: err.message });
  }
});

// Jüri üyesi ekleme
router.post('/juri', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { tc_kimlik, ad, soyad, email } = req.body;
  try {
    // Kullanıcıyı ekle (rol: Juri)
    const userQuery = `
      INSERT INTO kullanici (tc_kimlik, ad, soyad, eposta, sifre, rol)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tc_kimlik) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(userQuery, [tc_kimlik, ad, soyad, email, 'default_password', 'Juri']);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Bu TC kimlik numarası zaten kayıtlı' });
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Jüri üyesi eklenemedi:', err);
    res.status(400).json({ message: 'Jüri üyesi eklenemedi', error: err.message });
  }
});

// Başvuruya jüri atama
router.post('/basvuru-juri', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { basvuru_id, juri_tcs } = req.body; // juri_tcs: ["tc1", "tc2", ...]
  try {
    for (const juri_tc of juri_tcs) {
      const query = 'INSERT INTO basvuru_juri (basvuru_id, juri_tc) VALUES ($1, $2)';
      await pool.query(query, [basvuru_id, juri_tc]);
    }
    res.status(201).json({ message: 'Jüri üyeleri atandı' });
  } catch (err) {
    console.error('Jüri atama hatası:', err);
    res.status(400).json({ message: 'Jüri atama hatası', error: err.message });
  }
});

// Başvuruların jüri değerlendirmelerini görüntüleme
router.get('/basvuru/:id/degerlendirmeler', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT jd.degerlendirme_id, jd.basvuru_id, jd.juri_tc, jd.rapor_dosyasi, jd.sonuc, jd.tarih,
             k.ad, k.soyad
      FROM juri_degerlendirme jd
      JOIN kullanici k ON jd.juri_tc = k.tc_kimlik
      WHERE jd.basvuru_id = $1
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Değerlendirmeler getirilemedi:', err);
    res.status(500).json({ message: 'Değerlendirmeler getirilemedi', error: err.message });
  }
});

module.exports = router;