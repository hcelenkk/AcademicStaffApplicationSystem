const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');

// Kriterleri Getirme (Yönetici)
router.get('/criteria', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kriter');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Kriter getirme hatası:', err.message);
    res.status(500).json({ message: 'Kriterler getirilemedi' });
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
    console.error('Kriter ekleme hatası:', err.message);
    res.status(500).json({ message: 'Kriter eklenemedi' });
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
      return res.status(404).json({ message: 'Kriter bulunamadı' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Kriter güncelleme hatası:', err.message);
    res.status(500).json({ message: 'Kriter güncellenemedi' });
  }
});

// Jüri Ekleme (Yönetici)
router.post('/juri', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { tc_kimlik, ad, soyad, eposta } = req.body;

  try {
    const query = `
      INSERT INTO kullanici (tc_kimlik, sifre, ad, soyad, rol, eposta)
      VALUES ($1, $2, $3, $4, 'Jüri', $5) RETURNING *`;
    const defaultPassword = await bcrypt.hash('defaultJuriPassword123', 10); // Varsayılan şifre
    const values = [tc_kimlik, defaultPassword, ad, soyad, eposta];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Jüri ekleme hatası:', err.message);
    res.status(500).json({ message: 'Jüri eklenemedi' });
  }
});

// Jüri Atama (Yönetici)
router.post('/application-juri', authMiddleware, roleMiddleware(['Yönetici']), async (req, res) => {
  const { basvuru_id, juriTcKimliks } = req.body;

  try {
    for (const tc_kimlik of juriTcKimliks) {
      const query = `
        INSERT INTO juri_degerlendirme (tc_kimlik, basvuru_id, sonuc, tarih)
        VALUES ($1, $2, 'Değerlendirme Bekleniyor', NOW())`;
      await pool.query(query, [tc_kimlik, basvuru_id]);
    }
    res.status(200).json({ message: 'Jüri üyeleri başarıyla atandı' });
  } catch (err) {
    console.error('Jüri atama hatası:', err.message);
    res.status(500).json({ message: 'Jüri atama başarısız' });
  }
});

module.exports = router;