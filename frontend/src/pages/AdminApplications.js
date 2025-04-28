// src/pages/AdminApplications.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    durum: '',
    aday_ad: '',
    kategori: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/admin', { params: filters });
        setApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          setError(err.response?.data?.message || 'Başvurular yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (basvuru_id, newStatus, tc_kimlik, ilan) => {
    setLoading(true);
    try {
      // Başvuru durumunu güncelle
      const response = await api.put(`/applications/update-status/${basvuru_id}`, { durum: newStatus });
      setApplications(
        applications.map((app) =>
          app.basvuru_id === basvuru_id ? { ...app, durum: response.data.durum } : app
        )
      );

      // Bildirim oluştur
      const notificationMessage = `Başvurunuzun durumu güncellendi: ${newStatus} (İlan: ${ilan.kategori} - ${ilan.aciklama})`;
      console.log('Bildirim gönderiliyor:', { tc_kimlik, tur: 'Başvuru Güncellemesi', mesaj: notificationMessage, tarih: new Date().toISOString() });
      await api.post('/notifications', {
        tc_kimlik: tc_kimlik,
        tur: 'Başvuru Güncellemesi',
        mesaj: notificationMessage,
        tarih: new Date().toISOString(),
      });

      setSuccess('Başvuru durumu başarıyla güncellendi ve bildirim gönderildi!');
      setError('');
    } catch (err) {
      // Hata mesajını daha ayrıntılı logla ve göster
      console.error('Durum güncelleme veya bildirim hatası:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Bilinmeyen bir hata oluştu.';
      const errorDetail = err.response?.data?.error || err.response?.data?.detail || '';
      if (err.response?.status === 404) {
        setError('Bildirim endpoint\'i bulunamadı. Backend yapılandırmasını kontrol edin.');
      } else if (err.response?.status === 400) {
        setError(`Bildirim oluşturulamadı: ${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}`);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setError(
          `Durum güncellenemedi veya bildirim gönderilemedi: ${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}`
        );
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Tarih belirtilmemiş';
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 1 }}>
        <Typography variant="h5" gutterBottom>
          Filtreler
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Durum</InputLabel>
            <Select
              name="durum"
              value={filters.durum}
              onChange={handleFilterChange}
              label="Durum"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Beklemede">Beklemede</MenuItem>
              <MenuItem value="Kabul Edildi">Kabul Edildi</MenuItem>
              <MenuItem value="Reddedildi">Reddedildi</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Aday Adı"
            name="aday_ad"
            value={filters.aday_ad}
            onChange={handleFilterChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Kategori</InputLabel>
            <Select
              name="kategori"
              value={filters.kategori}
              onChange={handleFilterChange}
              label="Kategori"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Dr. Öğr. Üyesi">Dr. Öğretim Üyesi</MenuItem>
              <MenuItem value="Doçent">Doçent</MenuItem>
              <MenuItem value="Profesör">Profesör</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ maxWidth: '100px' }}>
          <Typography variant="h5" gutterBottom sx={{ width: 'fit-content', textAlign: 'left' }}>
            Başvurular
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, maxWidth: '10px' }}>
            <CircularProgress />
          </Box>
        ) : applications.length > 0 ? (
          <List>
            {applications.map((app) => (
              <ListItem
                key={app.basvuru_id}
                alignItems="flex-start"
                secondaryAction={
                  <FormControl sx={{ minWidth: 150, ml: 2 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={app.durum}
                      onChange={(e) =>
                        handleStatusChange(
                          app.basvuru_id,
                          e.target.value,
                          app.aday.tc_kimlik,
                          app.ilan
                        )
                      }
                      label="Durum"
                      disabled={loading}
                    >
                      <MenuItem value="Beklemede">Beklemede</MenuItem>
                      <MenuItem value="Kabul Edildi">Kabul Edildi</MenuItem>
                      <MenuItem value="Reddedildi">Reddedildi</MenuItem>
                    </Select>
                  </FormControl>
                }
              >
                <ListItemText
                  sx={{ maxWidth: 'calc(100% - 180px)' }}
                  primary={`Aday: ${app.aday.ad} ${app.aday.soyad}`}
                  secondary={`İlan: ${app.ilan.kategori} - ${app.ilan.aciklama} | Başvuru Tarihi: ${formatDate(app.olusturulma_tarih)} | Puan: ${app.puan !== null ? app.puan : 'Puanlama yapılmamış'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Başvuru bulunmamaktadır.
          </Typography>
        )}

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

export default AdminApplications;