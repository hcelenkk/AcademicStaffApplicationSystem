const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

// Kayıt Olma
router.post('/register', async (req, res) => {
  const { tc_kimlik, ad, soyad, eposta, sifre } = req.body;

  // Doğrulamalar
  if (!ad || !soyad) {
    return res.status(400).json({ message: 'Ad ve soyad alanları boş olamaz.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) {
    return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin.' });
  }

  try {
    // Kullanıcı zaten var mı kontrol et
    const userCheck = await pool.query('SELECT * FROM public.kullanici WHERE tc_kimlik = $1 OR eposta = $2', [tc_kimlik, eposta]);
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ message: 'Bu TC Kimlik numarası veya e-posta adresi zaten kayıtlı.' });
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sifre, salt);

    // Kullanıcıyı ekle
    const query = `
      INSERT INTO public.kullanici (tc_kimlik, ad, soyad, eposta, sifre, rol)
      VALUES ($1, $2, $3, $4, $5, 'Aday') RETURNING *`;
    const values = [tc_kimlik, ad, soyad, eposta, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    console.error('Kayıt hatası:', err.message);
    res.status(500).json({ message: 'Kayıt yapılamadı' });
  }
});

// Giriş Yapma
router.post('/login', async (req, res) => {
  const { tc_kimlik, sifre } = req.body;

  if (!sifre) {
    return res.status(400).json({ message: 'Şifre alanı boş olamaz.' });
  }

  try {
    const userQuery = 'SELECT * FROM public.kullanici WHERE tc_kimlik = $1';
    const userResult = await pool.query(userQuery, [tc_kimlik]);

    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(sifre, user.sifre);
    if (!validPassword) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    const token = jwt.sign(
      { tc_kimlik: user.tc_kimlik, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Giriş hatası:', err.message);
    res.status(500).json({ message: 'Giriş yapılamadı' });
  }
});

// Şifremi Unuttum
router.post('/forgot-password', async (req, res) => {
  const { tc_kimlik, eposta } = req.body;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) {
    return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin.' });
  }

  try {
    const userQuery = 'SELECT * FROM public.kullanici WHERE tc_kimlik = $1 AND eposta = $2';
    const userResult = await pool.query(userQuery, [tc_kimlik, eposta]);

    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı veya e-posta adresi eşleşmiyor' });
    }

    const user = userResult.rows[0];
    const resetToken = jwt.sign(
      { tc_kimlik: user.tc_kimlik },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Şifre Sıfırlama Talebi';
    const text = `Merhaba ${user.ad},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetLink}\n\nBu bağlantı 15 dakika boyunca geçerlidir.\n\nİyi günler!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Merhaba ${user.ad},</h2>
        <p style="font-size: 16px; color: #555;">
          Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
        </p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
            Şifreyi Sıfırla
          </a>
        </p>
        <p style="font-size: 16px; color: #555;">
          Bu bağlantı 15 dakika boyunca geçerlidir.
        </p>
        <p style="font-size: 16px; color: #555;">
          İyi günler dileriz!
        </p>
        <p style="font-size: 14px; color: #777; font-style: italic;">
          Başvuru Yönetim Sistemi Ekibi
        </p>
      </div>
    `;

    await sendEmail(user.eposta, subject, text, html);
    res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
  } catch (err) {
    console.error('Şifre sıfırlama hatası:', err.message);
    res.status(500).json({ message: 'Şifre sıfırlama bağlantısı gönderilemedi' });
  }
});

// Şifre Sıfırlama
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { sifre } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tc_kimlik = decoded.tc_kimlik;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sifre, salt);

    const query = 'UPDATE public.kullanici SET sifre = $1 WHERE tc_kimlik = $2 RETURNING *';
    const values = [hashedPassword, tc_kimlik];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (err) {
    console.error('Şifre sıfırlama hatası:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Şifre sıfırlama bağlantısının süresi dolmuş.' });
    }
    res.status(500).json({ message: 'Şifre sıfırlama başarısız' });
  }
});

module.exports = router;