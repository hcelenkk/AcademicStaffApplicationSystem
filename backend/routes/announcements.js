// routes/announcements.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Tüm İlanları Getirme
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT 
        i.ilan_id,
        i.kategori,
        i.aciklama,
        i.baslangic_tarih,
        i.bitis_tarih,
        i.tc_kimlik,
        i.kriter_json,
        i.son_guncelleme,
        k.ad,
        k.soyad
      FROM ilan i
      JOIN kullanici k ON i.tc_kimlik = k.tc_kimlik
      ORDER BY i.baslangic_tarih DESC
    `;
    const result = await pool.query(query);

    // Veriyi frontend'in beklediği formata dönüştür
    const announcements = result.rows.map((row) => ({
      ilan_id: row.ilan_id,
      kategori: row.kategori,
      aciklama: row.aciklama,
      baslangic_tarih: row.baslangic_tarih,
      bitis_tarih: row.bitis_tarih,
      tc_kimlik: row.tc_kimlik,
      kriter_json: row.kriter_json,
      son_guncelleme: row.son_guncelleme,
      yayinlayan: {
        tc_kimlik: row.tc_kimlik,
        ad: row.ad,
        soyad: row.soyad,
      },
    }));

    res.status(200).json(announcements);
  } catch (err) {
    console.error('İlan getirme hatası:', err.stack);
    res.status(500).json({ message: 'İlanlar getirilemedi.' });
  }
});

// Yeni İlan Oluşturma (Admin)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json } = req.body;
  const tc_kimlik = req.user.tc_kimlik;

  if (!kategori || !aciklama || !baslangic_tarih || !bitis_tarih) {
    return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
  }

  try {
    const query = `
      INSERT INTO ilan (kategori, aciklama, baslangic_tarih, bitis_tarih, tc_kimlik, kriter_json, son_guncelleme)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, tc_kimlik, kriter_json || null];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('İlan oluşturma hatası:', err.stack);
    res.status(500).json({ message: 'İlan oluşturulamadı.' });
  }
});

// İlan Güncelleme (Admin)
router.put('/:ilan_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { ilan_id } = req.params;
  const { kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json } = req.body;

  if (!kategori || !aciklama || !baslangic_tarih || !bitis_tarih) {
    return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
  }

  try {
    const query = `
      UPDATE ilan
      SET kategori = $1, aciklama = $2, baslangic_tarih = $3, bitis_tarih = $4, kriter_json = $5, son_guncelleme = CURRENT_TIMESTAMP
      WHERE ilan_id = $6
      RETURNING *
    `;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json || null, ilan_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('İlan güncelleme hatası:', err.stack);
    res.status(500).json({ message: 'İlan güncellenemedi.' });
  }
});

// İlan Silme (Admin)
router.delete('/:ilan_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { ilan_id } = req.params;

  try {
    const query = `
      DELETE FROM ilan
      WHERE ilan_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [ilan_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı.' });
    }

    res.status(200).json({ message: 'İlan başarıyla silindi.' });
  } catch (err) {
    console.error('İlan silme hatası:', err.stack);
    res.status(500).json({ message: 'İlan silinemedi.' });
  }
});

module.exports = router;