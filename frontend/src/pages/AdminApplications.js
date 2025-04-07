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
import Header from '../components/Header';

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
        setError('Başvurular yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (basvuru_id, newStatus) => {
    setLoading(true);
    try {
      const response = await api.put(`/applications/update-status/${basvuru_id}`, { durum: newStatus });
      setApplications(
        applications.map((app) =>
          app.basvuru_id === basvuru_id ? { ...app, durum: response.data.durum } : app
        )
      );
      setSuccess('Başvuru durumu başarıyla güncellendi!');
      setError('');
    } catch (err) {
      console.error('Durum güncelleme hatası:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Durum güncellenemedi. Lütfen tekrar deneyin.');
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
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Paneli - Başvuru Yönetimi
          </Typography>

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

          <Typography variant="h5" gutterBottom>
            Başvurular
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem
                  key={app.basvuru_id}
                  secondaryAction={
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={app.durum}
                        onChange={(e) => handleStatusChange(app.basvuru_id, e.target.value)}
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
      </Container>
    </>
  );
};

export default AdminApplications;