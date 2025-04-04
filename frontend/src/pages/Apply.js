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
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import Header from '../components/Header';

const Apply = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('İlanlar yükleniyor...');
        const response = await api.get('/announcements');
        console.log('İlanlar başarıyla yüklendi:', response.data);
        setAnnouncements(response.data || []);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err.response?.data || err.message);
        if (err.response?.status === 204) {
          setAnnouncements([]);
        } else {
          setError(err.response?.data?.message || 'İlanlar yüklenemedi. Lütfen tekrar deneyin.');
        }
      }
    };
    fetchAnnouncements();
  }, []);

  const handleApply = async (ilan_id) => {
    setLoading(true);
    try {
      console.log('Başvuru yapılıyor, ilan_id:', ilan_id);
      const response = await api.post('/applications', { ilan_id });
      console.log('Başvuru yanıtı:', response.data);
      setSuccess('Başvuru başarıyla yapıldı!');
      setError('');
    } catch (err) {
      console.error('Başvuru hatası:', err.response?.data || err);
      setError(err.response?.data?.message || 'Başvuru başarısız. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
      console.log('Loading durumu sıfırlandı:', loading); // Hata ayıklama için log
    }
  };

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

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            İlanlar
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/apply')}
            >
              İlanlar
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/my-applications')}
            >
              Başvurularım
            </Button>
          </Box>
          {announcements.length > 0 ? (
            <List>
              {announcements.map((ann) => {
                console.log('İlan durumu:', ann.durum); // Durum değerini logla
                return (
                  <ListItem
                    key={ann.ilan_id}
                    secondaryAction={
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApply(ann.ilan_id)}
                        disabled={loading || (ann.durum !== 'Aktif' && ann.durum !== undefined)}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Başvur'}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={`${ann.kategori} - ${ann.aciklama}`}
                      secondary={`Tarih: ${formatDate(ann.baslangic_tarih)} - ${formatDate(ann.bitis_tarih)}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Şu anda aktif ilan bulunmamaktadır.
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

export default Apply;