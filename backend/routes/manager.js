// routes/manager.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Kriterleri Getirme (Yönetici)
router.get('/criteria', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kriter');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Kriter getirme hatası:', {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Kriterler getirilemedi.', error: err.message });
  }
});

// Yeni Kriter Ekleme (Yönetici)
router.post('/criteria', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { kategori, aciklama, min_puan, max_puan, aktif } = req.body;

  try {
    const query = `
      INSERT INTO kriter (kategori, aciklama, min_puan, max_puan, aktif)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [kategori, aciklama, min_puan, max_puan, aktif !== undefined ? aktif : true];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Kriter ekleme hatası:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Kriter eklenemedi.', error: err.message });
  }
});

// Kriter Güncelleme (Yönetici)
router.put('/criteria/:kriter_id', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { kriter_id } = req.params;
  const { kategori, aciklama, min_puan, max_puan, aktif } = req.body;

  try {
    const query = `
      UPDATE kriter
      SET kategori = $1, aciklama = $2, min_puan = $3, max_puan = $4, aktif = $5
      WHERE kriter_id = $6 RETURNING *`;
    const values = [kategori, aciklama, min_puan, max_puan, aktif, kriter_id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Kriter bulunamadı.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Kriter güncelleme hatası:', {
      error: err.message,
      stack: err.stack,
      kriter_id,
      body: req.body,
    });
    res.status(500).json({ message: 'Kriter güncellenemedi.', error: err.message });
  }
});

// Jüri Ekleme (Yönetici)
router.post('/juri', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { tc_kimlik, ad, soyad, eposta, sifre } = req.body;

  if (!tc_kimlik || !ad || !soyad || !eposta) {
    return res.status(400).json({ message: 'TC kimlik, ad, soyad ve e-posta zorunludur.' });
  }

  try {
    const query = `
      INSERT INTO kullanici (tc_kimlik, sifre, ad, soyad, rol, eposta)
      VALUES ($1, $2, $3, $4, 'Jüri', $5) RETURNING *`;
    const hashedPassword = sifre ? await bcrypt.hash(sifre, 10) : await bcrypt.hash('defaultJuriPassword123', 10);
    const values = [tc_kimlik, hashedPassword, ad, soyad, eposta];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Jüri ekleme hatası:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Jüri eklenemedi.', error: err.message });
  }
});

// Jüri Atama (Yönetici)
router.post('/application-juri', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { basvuru_id, juriTcKimliks } = req.body;

  if (!basvuru_id || !juriTcKimliks || !Array.isArray(juriTcKimliks) || juriTcKimliks.length === 0) {
    return res.status(400).json({ message: 'Başvuru ID ve jüri üyeleri (tc_kimlik listesi) zorunludur.' });
  }

  try {
    // Başvurunun varlığını kontrol et
    const basvuruQuery = 'SELECT * FROM basvuru WHERE basvuru_id = $1';
    const basvuruResult = await pool.query(basvuruQuery, [basvuru_id]);
    if (basvuruResult.rowCount === 0) {
      return res.status(404).json({ message: 'Başvuru bulunamadı.' });
    }

    // Jüri üyelerinin varlığını ve rollerini kontrol et
    const juriCheckQuery = 'SELECT tc_kimlik FROM kullanici WHERE tc_kimlik = ANY($1) AND rol = $2';
    const juriCheckResult = await pool.query(juriCheckQuery, [juriTcKimliks, 'Jüri']);
    if (juriCheckResult.rowCount !== juriTcKimliks.length) {
      const foundTcKimliks = juriCheckResult.rows.map(row => row.tc_kimlik);
      const missingTcKimliks = juriTcKimliks.filter(tc => !foundTcKimliks.includes(tc));
      return res.status(400).json({
        message: 'Bazı jüri üyeleri geçersiz veya rolü Jüri değil.',
        missingTcKimliks,
      });
    }

    // Jüri atamalarını kaydet
    const insertQuery = `
      INSERT INTO juri_degerlendirme (tc_kimlik, basvuru_id, sonuc, tarih)
      SELECT unnest($1::varchar[]), $2, 'Değerlendirme Bekleniyor', NOW()
      ON CONFLICT (tc_kimlik, basvuru_id) DO NOTHING
      RETURNING *`;
    const insertValues = [juriTcKimliks, basvuru_id];
    const insertResult = await pool.query(insertQuery, insertValues);

    if (insertResult.rowCount === 0) {
      return res.status(400).json({ message: 'Jüri üyeleri zaten atanmış.' });
    }

    res.status(200).json({ message: 'Jüri üyeleri başarıyla atandı.', assigned: insertResult.rows });
  } catch (err) {
    console.error('Jüri atama hatası:', {
      error: err.message,
      stack: err.stack,
      basvuru_id,
      juriTcKimliks,
    });
    res.status(500).json({ message: 'Jüri atama başarısız.', error: err.message });
  }
});

module.exports = router;