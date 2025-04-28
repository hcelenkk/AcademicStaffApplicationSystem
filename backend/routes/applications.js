// routes/applications.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Tüm Başvuruları Getirme (Admin ve Yönetici)
router.get('/admin', authMiddleware, roleMiddleware(['Admin', 'Yönetici']), async (req, res) => {
  const { durum, aday_ad, kategori } = req.query;

  try {
    let query = `
      SELECT 
        b.basvuru_id,
        b.tc_kimlik,
        b.ilan_id,
        b.durum,
        b.puan,
        b.olusturulma_tarih,
        b.son_guncelleme,
        k.ad,
        k.soyad,
        i.ilan_id AS ilan_ilan_id,
        i.kategori AS ilan_kategori,
        i.aciklama AS ilan_aciklama,
        i.baslangic_tarih AS ilan_baslangic_tarih,
        i.bitis_tarih AS ilan_bitis_tarih,
        i.kriter_json AS ilan_kriter_json
      FROM basvuru b
      JOIN kullanici k ON b.tc_kimlik = k.tc_kimlik
      JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (durum) {
      query += ` AND b.durum = $${paramIndex++}`;
      values.push(durum);
    }
    if (aday_ad) {
      query += ` AND (k.ad ILIKE $${paramIndex} OR k.soyad ILIKE $${paramIndex})`;
      values.push(`%${aday_ad}%`);
      paramIndex++;
    }
    if (kategori) {
      query += ` AND i.kategori = $${paramIndex++}`;
      values.push(kategori);
    }

    query += ` ORDER BY b.olusturulma_tarih DESC`;

    const result = await pool.query(query, values);

    const applications = result.rows.map((row) => ({
      basvuru_id: row.basvuru_id,
      tc_kimlik: row.tc_kimlik,
      ilan_id: row.ilan_id,
      durum: row.durum,
      puan: row.puan,
      olusturulma_tarih: row.olusturulma_tarih,
      son_guncelleme: row.son_guncelleme,
      aday: {
        tc_kimlik: row.tc_kimlik,
        ad: row.ad,
        soyad: row.soyad,
      },
      ilan: {
        ilan_id: row.ilan_ilan_id,
        kategori: row.ilan_kategori,
        aciklama: row.ilan_aciklama,
        baslangic_tarih: row.ilan_baslangic_tarih,
        bitis_tarih: row.ilan_bitis_tarih,
        kriter_json: row.ilan_kriter_json,
      },
    }));

    res.status(200).json(applications);
  } catch (err) {
    console.error('Başvuru getirme hatası:', {
      error: err.message,
      stack: err.stack,
      queryParams: req.query,
    });
    res.status(500).json({ message: 'Başvurular getirilemedi.', error: err.message });
  }
});

// Adayın Başvurularını Getirme (Aday)
router.get('/my-applications', authMiddleware, async (req, res) => {
  const tc_kimlik = req.user.tc_kimlik;

  try {
    const query = `
      SELECT 
        b.basvuru_id,
        b.tc_kimlik,
        b.ilan_id,
        b.durum,
        b.puan,
        b.olusturulma_tarih,
        b.son_guncelleme,
        i.ilan_id AS ilan_ilan_id,
        i.kategori AS ilan_kategori,
        i.aciklama AS ilan_aciklama,
        i.baslangic_tarih AS ilan_baslangic_tarih,
        i.bitis_tarih AS ilan_bitis_tarih,
        i.kriter_json AS ilan_kriter_json
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE b.tc_kimlik = $1
      ORDER BY b.olusturulma_tarih DESC`;
    const result = await pool.query(query, [tc_kimlik]);

    const applications = result.rows.map((row) => ({
      basvuru_id: row.basvuru_id,
      tc_kimlik: row.tc_kimlik,
      ilan_id: row.ilan_id,
      durum: row.durum,
      puan: row.puan,
      olusturulma_tarih: row.olusturulma_tarih,
      son_guncelleme: row.son_guncelleme,
      ilan: {
        ilan_id: row.ilan_ilan_id,
        kategori: row.ilan_kategori,
        aciklama: row.ilan_aciklama,
        baslangic_tarih: row.ilan_baslangic_tarih,
        bitis_tarih: row.ilan_bitis_tarih,
        kriter_json: row.ilan_kriter_json,
      },
    }));

    res.status(200).json(applications);
  } catch (err) {
    console.error('Başvuru getirme hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik,
    });
    res.status(500).json({ message: 'Başvurular getirilemedi.', error: err.message });
  }
});

// Yeni Başvuru Oluşturma (Aday)
router.post('/', authMiddleware, async (req, res) => {
  const { ilan_id } = req.body;
  const tc_kimlik = req.user.tc_kimlik;

  if (!ilan_id) {
    return res.status(400).json({ message: 'İlan ID zorunludur.' });
  }

  try {
    // İlanın aktif olup olmadığını kontrol et
    const ilanQuery = `
      SELECT * FROM ilan
      WHERE ilan_id = $1 AND bitis_tarih >= CURRENT_DATE`;
    const ilanResult = await pool.query(ilanQuery, [ilan_id]);
    if (ilanResult.rowCount === 0) {
      return res.status(400).json({ message: 'Bu ilan artık aktif değil.' });
    }

    // Aynı ilana daha önce başvurulup başvurulmadığını kontrol et
    const existingApplicationQuery = `
      SELECT * FROM basvuru
      WHERE tc_kimlik = $1 AND ilan_id = $2`;
    const existingApplicationResult = await pool.query(existingApplicationQuery, [tc_kimlik, ilan_id]);
    if (existingApplicationResult.rowCount > 0) {
      return res.status(400).json({ message: 'Bu ilana zaten başvurdunuz.' });
    }

    // Yeni başvuru oluştur
    const query = `
      INSERT INTO basvuru (tc_kimlik, ilan_id, durum, olusturulma_tarih, son_guncelleme)
      VALUES ($1, $2, 'Beklemede', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`;
    const values = [tc_kimlik, ilan_id];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Başvuru oluşturma hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik,
      ilan_id,
    });
    res.status(500).json({ message: 'Başvuru oluşturulamadı.', error: err.message });
  }
});

// Başvuru Durumunu Güncelleme (Admin)
router.put('/update-status/:basvuru_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { basvuru_id } = req.params;
  const { durum } = req.body;

  if (!durum) {
    return res.status(400).json({ message: 'Durum alanı zorunludur.' });
  }

  try {
    const query = `
      UPDATE basvuru
      SET durum = $1, son_guncelleme = CURRENT_TIMESTAMP
      WHERE basvuru_id = $2
      RETURNING *`;
    const values = [durum, basvuru_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Başvuru güncelleme hatası:', {
      error: err.message,
      stack: err.stack,
      basvuru_id,
      durum,
    });
    res.status(500).json({ message: 'Başvuru durumu güncellenemedi.', error: err.message });
  }
});

module.exports = router;