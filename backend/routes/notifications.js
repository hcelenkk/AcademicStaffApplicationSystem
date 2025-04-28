// routes/notifications.js
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
    console.error('Bildirim getirme hatası:', err.stack);
    res.status(500).json({ message: 'Bildirimler getirilemedi.' });
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
      WHERE bildirim_id = $1 AND tc_kimlik = $2
      RETURNING *`;
    const result = await pool.query(query, [bildirim_id, tc_kimlik]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Bildirim bulunamadı veya size ait değil.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Bildirim güncelleme hatası:', err.stack);
    res.status(500).json({ message: 'Bildirim okundu olarak işaretlenemedi.' });
  }
});

// Yeni Bildirim Oluşturma (Admin)
router.post('/', authMiddleware, async (req, res) => {
  const { tc_kimlik, tur, mesaj, tarih } = req.body;

  // Zorunlu alan kontrolü
  if (!tc_kimlik || !tur || !mesaj || !tarih) {
    return res.status(400).json({ message: 'Tüm zorunlu alanlar (tc_kimlik, tur, mesaj, tarih) doldurulmalıdır.' });
  }

  try {
    // tc_kimlik'in kullanıcı tablosunda var olup olmadığını kontrol et
    const userCheckQuery = `
      SELECT * FROM kullanici WHERE tc_kimlik = $1`;
    const userCheckResult = await pool.query(userCheckQuery, [tc_kimlik]);
    if (userCheckResult.rowCount === 0) {
      return res.status(400).json({ message: `Kullanıcı bulunamadı: tc_kimlik=${tc_kimlik}` });
    }

    // Tarih formatını kontrol et ve PostgreSQL'e uygun hale getir
    let formattedDate;
    try {
      formattedDate = new Date(tarih).toISOString();
    } catch (dateErr) {
      return res.status(400).json({ message: `Geçersiz tarih formatı: ${tarih}` });
    }

    const query = `
      INSERT INTO bildirim (tc_kimlik, tur, mesaj, tarih, okundu)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    const values = [tc_kimlik, tur, mesaj, formattedDate, false]; // Varsayılan olarak okundu=false
    console.log('Bildirim ekleme sorgusu:', { query, values }); // Sorguyu logla
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Bildirim oluşturma hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik,
      tur,
      mesaj,
      tarih,
      code: err.code, // PostgreSQL hata kodu
      detail: err.detail, // Hata detayı
      constraint: err.constraint, // Kısıtlama adı (örneğin, foreign key)
    });
    res.status(500).json({ message: 'Bildirim oluşturulamadı.', error: err.message, code: err.code, detail: err.detail });
  }
});

module.exports = router;