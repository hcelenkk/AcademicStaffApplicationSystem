const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Aday']),
  async (req, res) => {
    const { ilan_id } = req.body;
    try {
      const application = await Application.create(req.user.tc_kimlik, ilan_id);
      res.status(201).json(application);
    } catch (err) {
      res.status(400).json({ message: 'Başvuru oluşturulamadı', error: err.message });
    }
  }
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Aday']),
  async (req, res) => {
    try {
      const applications = await Application.getByAday(req.user.tc_kimlik);
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: 'Başvurular alınamadı', error: err.message });
    }
  }
);

// Admin: Tüm başvuruları listele
router.get(
  '/admin',
  authMiddleware,
  roleMiddleware(['Admin']),
  async (req, res) => {
    try {
      const applications = await Application.getAll();
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: 'Başvurular alınamadı', error: err.message });
    }
  }
);

// Admin: Bir başvurunun durumunu güncelle
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Admin']),
  async (req, res) => {
    const { id } = req.params;
    const { durum } = req.body;
    try {
      const updatedApplication = await Application.updateStatus(parseInt(id, 10), durum);
      res.json(updatedApplication);
    } catch (err) {
      res.status(400).json({ message: 'Başvuru durumu güncellenemedi', error: err.message });
    }
  }
);

module.exports = router;