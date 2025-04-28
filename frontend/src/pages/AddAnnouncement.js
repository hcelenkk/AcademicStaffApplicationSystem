// src/pages/AddAnnouncement.js
import React, { useState } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

const AddAnnouncement = ({ setActiveTab }) => {
  const [newAnnouncement, setNewAnnouncement] = useState({
    kategori: '',
    aciklama: '',
    baslangic_tarih: '',
    bitis_tarih: '',
    kriter_json: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAnnouncementChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const handleAddAnnouncement = async () => {
    if (
      !newAnnouncement.kategori ||
      !newAnnouncement.aciklama ||
      !newAnnouncement.baslangic_tarih ||
      !newAnnouncement.bitis_tarih
    ) {
      setError('Tüm zorunlu alanlar doldurulmalıdır.');
      return;
    }

    // Tarih doğrulama: Başlangıç tarihi bitiş tarihinden önce olmalı
    const startDate = new Date(newAnnouncement.baslangic_tarih);
    const endDate = new Date(newAnnouncement.bitis_tarih);
    if (startDate >= endDate) {
      setError('Başlangıç tarihi bitiş tarihinden önce olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/announcements', newAnnouncement, {
        timeout: 10000, // 10 saniye zaman aşımı
      });
      setSuccess('İlan başarıyla eklendi!');
      setError('');
      setNewAnnouncement({ kategori: '', aciklama: '', baslangic_tarih: '', bitis_tarih: '', kriter_json: '' });
      setActiveTab('mevcut-ilanlar');
    } catch (err) {
      console.error('İlan eklenemedi:', err.response?.data || err.message);
      if (err.code === 'ECONNABORTED') {
        setError('Sunucuya ulaşılamadı. Lütfen backend sunucusunun çalıştığından emin olun.');
      } else if (err.response) {
        setError(err.response.data?.message || 'İlan eklenemedi. Lütfen tekrar deneyin.');
      } else {
        setError('Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Yeni İlan Ekle
        </Typography>
        <Box sx={{ mb: 4 }}>
          <TextField
            label="Kategori"
            name="kategori"
            value={newAnnouncement.kategori}
            onChange={handleAnnouncementChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Açıklama"
            name="aciklama"
            value={newAnnouncement.aciklama}
            onChange={handleAnnouncementChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Başlangıç Tarihi"
            name="baslangic_tarih"
            type="date"
            value={newAnnouncement.baslangic_tarih}
            onChange={handleAnnouncementChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Bitiş Tarihi"
            name="bitis_tarih"
            type="date"
            value={newAnnouncement.bitis_tarih}
            onChange={handleAnnouncementChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Kriter"
            name="kriter_json"
            value={newAnnouncement.kriter_json}
            onChange={handleAnnouncementChange}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleAddAnnouncement}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'İlan Ekle'}
          </Button>
        </Box>

        <Snackbar
          open={!!success || !!error}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {success || error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AddAnnouncement;