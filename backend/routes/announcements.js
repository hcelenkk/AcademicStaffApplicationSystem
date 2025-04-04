const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Sabit kategoriler
const kategoriler = ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'];

// Kategorileri döndüren endpoint
router.get('/kategoriler', async (req, res) => {
  try {
    res.json(kategoriler);
  } catch (err) {
    res.status(400).json({ message: 'Kategoriler getirilemedi', error: err.message });
  }
});

// İlanları döndüren endpoint
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM ilan
      WHERE bitis_tarih >= CURRENT_DATE`;
    const result = await pool.query(query);
    console.log('İlanlar getirildi:', result.rows); // Hata ayıklama için log
    if (result.rowCount === 0) {
      return res.status(204).send(); // Veri yoksa 204 dön
    }
    res.json(result.rows);
  } catch (err) {
    console.error('İlanlar getirilemedi:', err);
    res.status(500).json({ message: 'İlanlar getirilemedi', error: err.message });
  }
});

// Yeni bir ilan oluşturma (Admin için)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { kategori, aciklama, baslangic_tarih, bitis_tarih } = req.body;
  try {
    if (!kategoriler.includes(kategori)) {
      return res.status(400).json({ message: 'Geçersiz kategori' });
    }
    const query = `
      INSERT INTO ilan (kategori, aciklama, baslangic_tarih, bitis_tarih, durum)
      VALUES ($1, $2, $3, $4, 'Aktif') RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('İlan oluşturulamadı:', err);
    res.status(400).json({ message: 'İlan oluşturulamadı', error: err.message });
  }
});

// İlan güncelleme (Admin için)
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { id } = req.params;
  const { kategori, aciklama, baslangic_tarih, bitis_tarih, durum } = req.body;
  try {
    if (!kategoriler.includes(kategori)) {
      return res.status(400).json({ message: 'Geçersiz kategori' });
    }
    const query = `
      UPDATE ilan
      SET kategori = $1, aciklama = $2, baslangic_tarih = $3, bitis_tarih = $4, durum = $5
      WHERE ilan_id = $6 RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, durum || 'Aktif', id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('İlan güncellenemedi:', err);
    res.status(400).json({ message: 'İlan güncellenemedi', error: err.message });
  }
});

// İlan silme (Admin için)
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM ilan WHERE ilan_id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }
    res.json({ message: 'İlan başarıyla silindi' });
  } catch (err) {
    console.error('İlan silinemedi:', err);
    res.status(400).json({ message: 'İlan silinemedi', error: err.message });
  }
});

module.exports = router;