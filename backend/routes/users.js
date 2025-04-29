const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Kullanıcı bilgilerini getir (Kendi bilgilerini almak için)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const query = 'SELECT tc_kimlik, ad, soyad, eposta FROM kullanici WHERE tc_kimlik = $1';
    const result = await pool.query(query, [req.user.tc_kimlik]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik: req.user.tc_kimlik,
    });
    res.status(500).json({ message: 'Kullanıcı bilgileri getirilemedi.', error: err.message });
  }
});

// Kullanıcıları Getirme (Filtreleme ile, Yönetici, Jüri ve Admin için)
router.get('/', authMiddleware, roleMiddleware(['Yönetici', 'Jüri', 'Admin']), async (req, res) => {
  const { rol } = req.query;

  try {
    let query = 'SELECT tc_kimlik, ad, soyad, eposta, rol FROM kullanici';
    const values = [];
    if (rol) {
      query += ' WHERE rol = $1';
      values.push(rol);
    }

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Kullanıcı getirme hatası:', {
      error: err.message,
      stack: err.stack,
      queryParams: req.query,
    });
    res.status(500).json({ message: 'Kullanıcılar getirilemedi.', error: err.message });
  }
});

// Kullanıcı Rolünü Güncelleme (Yalnızca Admin için)
router.put('/:tc_kimlik/role', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { tc_kimlik } = req.params;
  const { rol } = req.body;

  try {
    const result = await pool.query(
      'UPDATE kullanici SET rol = $1, son_guncelleme = NOW() WHERE tc_kimlik = $2 RETURNING *',
      [rol, tc_kimlik]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Rol güncelleme hatası:', {
      error: err.message,
      stack: err.stack,
      tc_kimlik,
      rol,
    });
    res.status(500).json({ message: 'Rol güncellenemedi.', error: err.message });
  }
});

// Kullanıcı Kayıt (Register)
router.post('/register', async (req, res) => {
  const { tc_kimlik, ad, soyad, eposta, sifre, rol } = req.body;

  if (!tc_kimlik || !ad || !soyad || !eposta || !sifre) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM kullanici WHERE tc_kimlik = $1', [tc_kimlik]);
    if (userExists.rowCount > 0) {
      return res.status(400).json({ message: 'Bu TC Kimlik ile kayıtlı bir kullanıcı zaten var.' });
    }

    const emailExists = await pool.query('SELECT * FROM kullanici WHERE eposta = $1', [eposta]);
    if (emailExists.rowCount > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);
    await pool.query(
      'INSERT INTO kullanici (tc_kimlik, ad, soyad, eposta, sifre, rol) VALUES ($1, $2, $3, $4, $5, $6)',
      [tc_kimlik, ad, soyad, eposta, hashedPassword, rol || 'aday']
    );

    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.' });
  } catch (err) {
    console.error('Kayıt hatası:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.', error: err.message });
  }
});

// Kullanıcı Giriş (Login)
router.post('/login', async (req, res) => {
  const { tc_kimlik, sifre } = req.body;

  if (!tc_kimlik || !sifre) {
    return res.status(400).json({ message: 'TC Kimlik ve şifre zorunludur.' });
  }

  try {
    const user = await pool.query('SELECT * FROM kullanici WHERE tc_kimlik = $1', [tc_kimlik]);
    if (user.rowCount === 0) {
      return res.status(401).json({ message: 'Geçersiz TC Kimlik veya şifre.' });
    }

    const validPassword = await bcrypt.compare(sifre, user.rows[0].sifre);
    if (!validPassword) {
      return res.status(401).json({ message: 'Geçersiz TC Kimlik veya şifre.' });
    }

    const token = jwt.sign(
      { tc_kimlik: user.rows[0].tc_kimlik, rol: user.rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, rol: user.rows[0].rol });
  } catch (err) {
    console.error('Giriş hatası:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.', error: err.message });
  }
});

module.exports = router;