const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const Application = require('../models/application');

// Yeni Başvuru Oluşturma (Aday)
router.post('/', authMiddleware, roleMiddleware(['Aday']), async (req, res) => {
  const { ilan_id } = req.body;
  const tc_kimlik = req.user.tc_kimlik;

  if (!ilan_id) {
    return res.status(400).json({ message: 'İlan ID belirtilmelidir.' });
  }

  try {
    const application = await Application.create(tc_kimlik, ilan_id);
    res.status(201).json(application);
  } catch (err) {
    console.error('Başvuru oluşturma hatası:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Adayın Kendi Başvurularını Getirme (Aday)
router.get('/my-applications', authMiddleware, roleMiddleware(['Aday']), async (req, res) => {
  const tc_kimlik = req.user.tc_kimlik;

  try {
    const applications = await Application.getByAday(tc_kimlik);
    res.status(200).json(applications);
  } catch (err) {
    console.error('Başvuru getirme hatası:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Tüm Başvuruları Getirme (Admin)
router.get('/admin', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const filters = req.query;

  try {
    const applications = await Application.getAll(filters);
    res.status(200).json(applications);
  } catch (err) {
    console.error('Başvuru getirme hatası:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Başvuru Durumunu Güncelleme (Admin)
router.put('/update-status/:basvuru_id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { basvuru_id } = req.params;
  const { durum } = req.body;

  if (!durum) {
    return res.status(400).json({ message: 'Durum belirtilmelidir.' });
  }

  try {
    const updatedApplication = await Application.updateStatus(basvuru_id, durum);
    res.status(200).json(updatedApplication);
  } catch (err) {
    console.error('Durum güncelleme hatası:', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;