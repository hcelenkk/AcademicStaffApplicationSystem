import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Header from '../components/Header';

const Application = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [appliedAnnouncements, setAppliedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [announcementsResponse, applicationsResponse] = await Promise.all([
          api.get('/announcements'),
          api.get('/applications/my-applications'),
        ]);
        setAnnouncements(announcementsResponse.data);
        const appliedIds = applicationsResponse.data.map((app) => app.ilan.ilan_id);
        setAppliedAnnouncements(appliedIds);
      } catch (err) {
        console.error('Veriler yüklenemedi:', err.response?.data || err.message);
        setError('Veriler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (ilan_id) => {
    if (appliedAnnouncements.includes(ilan_id)) {
      setError('Bu ilana zaten başvurdunuz!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/applications', { ilan_id });
      setAppliedAnnouncements((prev) => [...prev, ilan_id]);
      setSuccess('Başvuru başarılı! Başvurularınızı görüntülemek için yönlendiriliyorsunuz.');
      setError('');
      setTimeout(() => navigate('/my-applications'), 2000);
      console.log('Başvuru yanıtı:', response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
      setSuccess('');
      console.error('Başvuru hatası:', err);
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

  const getAnnouncementStatus = (bitis_tarih) => {
    const today = new Date();
    const endDate = new Date(bitis_tarih);
    return endDate >= today ? 'Açık' : 'Kapalı';
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
            İlanlar
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : announcements.length > 0 ? (
            <List>
              {announcements.map((ann) => (
                <ListItem
                  key={ann.ilan_id}
                  secondaryAction={
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApply(ann.ilan_id)}
                      disabled={loading || getAnnouncementStatus(ann.bitis_tarih) !== 'Açık' || appliedAnnouncements.includes(ann.ilan_id)}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Başvur'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`Kategori: ${ann.kategori} - ${ann.aciklama}`}
                    secondary={`Başlangıç: ${formatDate(ann.baslangic_tarih)} - Bitiş: ${formatDate(ann.bitis_tarih)} | Durum: ${getAnnouncementStatus(ann.bitis_tarih)}`}
                  />
                </ListItem>
              ))}
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

export default Application;