const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Tüm İlanları Getirme (Herkes)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM public.ilan ORDER BY baslangic_tarih DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('İlan getirme hatası:', err.message);
    res.status(500).json({ message: 'İlanlar getirilemedi' });
  }
});

// Yeni İlan Ekleme (Admin)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json } = req.body;

  // Zorunlu alan kontrolü
  if (!kategori || !aciklama || !baslangic_tarih || !bitis_tarih) {
    return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
  }

  // Tarih formatı kontrolü
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(baslangic_tarih) || !dateRegex.test(bitis_tarih)) {
    return res.status(400).json({ message: 'Tarih formatı YYYY-MM-DD olmalıdır.' });
  }

  // Tarih mantıksal kontrolü
  if (new Date(baslangic_tarih) >= new Date(bitis_tarih)) {
    return res.status(400).json({ message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır.' });
  }

  try {
    const query = `
      INSERT INTO public.ilan (kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json || null];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('İlan ekleme hatası:', err.message);
    res.status(500).json({ message: 'İlan eklenemedi' });
  }
});

// İlan Güncelleme (Admin)
router.put('/:ilan_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { ilan_id } = req.params;
  const { kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json } = req.body;

  // Zorunlu alan kontrolü
  if (!kategori || !aciklama || !baslangic_tarih || !bitis_tarih) {
    return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
  }

  // Tarih formatı kontrolü
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(baslangic_tarih) || !dateRegex.test(bitis_tarih)) {
    return res.status(400).json({ message: 'Tarih formatı YYYY-MM-DD olmalıdır.' });
  }

  // Tarih mantıksal kontrolü
  if (new Date(baslangic_tarih) >= new Date(bitis_tarih)) {
    return res.status(400).json({ message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır.' });
  }

  try {
    const query = `
      UPDATE public.ilan
      SET kategori = $1, aciklama = $2, baslangic_tarih = $3, bitis_tarih = $4, kriter_json = $5
      WHERE ilan_id = $6 RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json || null, ilan_id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('İlan güncelleme hatası:', err.message);
    res.status(500).json({ message: 'İlan güncellenemedi' });
  }
});

// İlan Silme (Admin)
router.delete('/:ilan_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { ilan_id } = req.params;

  try {
    const query = 'DELETE FROM public.ilan WHERE ilan_id = $1 RETURNING *';
    const result = await pool.query(query, [ilan_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    res.status(200).json({ message: 'İlan başarıyla silindi' });
  } catch (err) {
    console.error('İlan silme hatası:', err.message);
    res.status(500).json({ message: 'İlan silinemedi' });
  }
});

module.exports = router;