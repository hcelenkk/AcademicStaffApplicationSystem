const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Admin']),
  async (req, res) => {
    const { kategori, baslangic_tarih, bitis_tarih, aciklama } = req.body;
    try {
      const announcement = await Announcement.create(
        kategori,
        baslangic_tarih,
        bitis_tarih,
        aciklama,
        req.user.tc_kimlik
      );
      res.status(201).json(announcement);
    } catch (err) {
      res.status(400).json({ message: 'İlan oluşturulamadı', error: err.message });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.getAll();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'İlanlar alınamadı', error: err.message });
  }
});

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Admin']),
  async (req, res) => {
    const { id } = req.params;
    const ilan_id = parseInt(id, 10);
    if (isNaN(ilan_id)) {
      return res.status(400).json({ message: 'Geçersiz ilan ID' });
    }
    try {
      await Announcement.delete(ilan_id);
      res.json({ message: 'İlan başarıyla silindi' });
    } catch (err) {
      res.status(400).json({ message: 'İlan silinemedi', error: err.message });
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Admin']),
  async (req, res) => {
    const { id } = req.params;
    const { kategori, baslangic_tarih, bitis_tarih, aciklama } = req.body;
    const ilan_id = parseInt(id, 10);
    if (isNaN(ilan_id)) {
      return res.status(400).json({ message: 'Geçersiz ilan ID' });
    }
    try {
      const updatedAnnouncement = await Announcement.update(
        ilan_id,
        kategori,
        baslangic_tarih,
        bitis_tarih,
        aciklama
      );
      if (!updatedAnnouncement) {
        return res.status(404).json({ message: 'İlan bulunamadı' });
      }
      res.json(updatedAnnouncement);
    } catch (err) {
      res.status(400).json({ message: 'İlan güncellenemedi', error: err.message });
    }
  }
);

module.exports = router;