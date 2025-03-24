const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { tc_kimlik, sifre } = req.body;
  const user = await User.findByTc(tc_kimlik);

  if (!user || !(await bcrypt.compare(sifre, user.sifre))) {
    return res.status(401).json({ message: 'TC Kimlik veya şifre hatalı' });
  }

  const token = jwt.sign(
    { tc_kimlik: user.tc_kimlik, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token, user: { tc_kimlik: user.tc_kimlik, rol: user.rol } });
});

router.post('/register', async (req, res) => {
  const { tc_kimlik, sifre, ad, soyad, rol, eposta } = req.body;
  try {
    const user = await User.create(tc_kimlik, sifre, ad, soyad, rol, eposta);
    res.status(201).json({ message: 'Kullanıcı oluşturuldu', user });
  } catch (err) {
    res.status(400).json({ message: 'Kullanıcı oluşturulamadı', error: err.message });
  }
});

module.exports = router;