const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

router.post('/register', async (req, res) => {
  const { tc_kimlik, ad, soyad, eposta, sifre, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(sifre, 10);
    const query = `
      INSERT INTO kullanici (tc_kimlik, ad, soyad, eposta, sifre, rol)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [tc_kimlik, ad, soyad, eposta, hashedPassword, role || 'Aday'];
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi' });
  } catch (err) {
    res.status(400).json({ message: 'Kayıt başarısız', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { tc_kimlik, sifre } = req.body;
  console.log('Giriş denemesi:', { tc_kimlik, sifre });
  try {
    const query = 'SELECT * FROM kullanici WHERE tc_kimlik = $1';
    const result = await pool.query(query, [tc_kimlik]);
    console.log('Veritabanı sonucu:', result.rows);

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];
    console.log('Bulunan kullanıcı:', user);

    const isMatch = await bcrypt.compare(sifre, user.sifre);
    console.log('Şifre eşleşti mi?', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    const token = jwt.sign(
      { tc_kimlik: user.tc_kimlik, rol: user.rol }, // "role" yerine "rol" olarak kodla
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    console.log('Dönen yanıt:', { token, rol: user.rol });
    res.json({ token, rol: user.rol });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(400).json({ message: 'Giriş başarısız', error: err.message });
  }
});

// Diğer endpoint'ler (forgot-password, reset-password) aynı kalabilir
router.post('/forgot-password', async (req, res) => {
  const { tc_kimlik, eposta } = req.body;
  try {
    const query = 'SELECT * FROM kullanici WHERE tc_kimlik = $1 AND eposta = $2';
    const result = await pool.query(query, [tc_kimlik, eposta]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'TC Kimlik Numarası veya e-posta adresi yanlış' });
    }
    const user = result.rows[0];

    const resetToken = jwt.sign(
      { tc_kimlik: user.tc_kimlik },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    const subject = 'Şifre Sıfırlama Talebi';
    const text = `Merhaba ${user.ad},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetLink}\n\nBu bağlantı 15 dakika boyunca geçerlidir.\n\nİyi günler dileriz!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2>Merhaba ${user.ad},</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${resetLink}" style="color: #007bff; text-decoration: none;">Şifremi Sıfırla</a></p>
        <p>Bu bağlantı 15 dakika boyunca geçerlidir.</p>
        <p>İyi günler dileriz!</p>
        <p><em>Başvuru Yönetim Sistemi Ekibi</em></p>
      </div>
    `;

    await sendEmail(user.eposta, subject, text, html);
    res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
  } catch (err) {
    res.status(400).json({ message: 'Bir hata oluştu', error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, sifre } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const tc_kimlik = decoded.tc_kimlik;

    const query = 'SELECT * FROM kullanici WHERE tc_kimlik = $1';
    const result = await pool.query(query, [tc_kimlik]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);
    const updateQuery = 'UPDATE kullanici SET sifre = $1 WHERE tc_kimlik = $2';
    await pool.query(updateQuery, [hashedPassword, tc_kimlik]);

    res.json({ message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Şifre sıfırlama bağlantısının süresi dolmuş.' });
    }
    res.status(400).json({ message: 'Bir hata oluştu', error: err.message });
  }
});

module.exports = router;