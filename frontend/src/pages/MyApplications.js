import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import Header from '../components/Header';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log('Başvurular yükleniyor...');
        const response = await api.get('/applications/my-applications');
        console.log('Başvurular başarıyla yüklendi:', response.data);
        setApplications(response.data || []);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Başvurular yüklenemedi. Lütfen tekrar deneyin.');
      }
    };
    fetchApplications();
  }, []);

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Belirtilmemiş';
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDurumLabel = (durum) => {
    const validDurumlar = ['Beklemede', 'Kabul Edildi', 'Reddedildi'];
    return validDurumlar.includes(durum) ? durum : 'Beklemede';
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Başvurularım
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/apply')}
            >
              İlanlar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/my-applications')}
            >
              Başvurularım
            </Button>
          </Box>
          {applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem key={app.basvuru_id}>
                  <ListItemText
                    primary={`${app.ilan.kategori} - ${app.ilan.aciklama}`}
                    secondary={`Başvuru Tarihi: ${formatDate(app.basvuru_tarih)} | Durum: ${getDurumLabel(app.durum)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz bir başvurunuz bulunmamaktadır.
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

export default MyApplications;