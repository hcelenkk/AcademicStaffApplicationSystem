import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için
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
} from '@mui/material';
import Header from '../components/Header';

const Application = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedAnnouncements, setAppliedAnnouncements] = useState(new Set());
  const navigate = useNavigate(); // Yönlendirme için

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleApply = async (ilan_id) => {
    if (appliedAnnouncements.has(ilan_id)) {
      alert('Bu ilana zaten başvurdunuz!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/applications', { ilan_id });
      setAppliedAnnouncements((prev) => new Set(prev).add(ilan_id));
      alert('Başvuru başarılı! Başvurularınızı görüntülemek için yönlendiriliyorsunuz.');
      navigate('/my-applications'); // Başvurudan sonra yönlendirme
      console.log('Başvuru yanıtı:', response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      alert(`Başvuru başarısız: ${errorMessage}`);
      console.error('Başvuru hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
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
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Başvuru Yap
          </Typography>
        </Box>
        {announcements.length > 0 ? (
          <List>
            {announcements.map((ann) => {
              const isApplied = appliedAnnouncements.has(ann.ilan_id);
              return (
                <ListItem
                  key={ann.ilan_id}
                  secondaryAction={
                    <Button
                      variant="contained"
                      color={isApplied ? 'success' : 'primary'}
                      onClick={() => handleApply(ann.ilan_id)}
                      disabled={loading || isApplied}
                      startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                      {loading ? 'Başvuruyor...' : isApplied ? 'Başvuruldu' : 'Başvur'}
                    </Button>
                  }
                  sx={{ py: 1 }}
                >
                  <ListItemText
                    primary={`${ann.kategori} - ${ann.aciklama}`}
                    secondary={`${formatDate(ann.baslangic_tarih)} - ${formatDate(ann.bitis_tarih)}`}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Henüz başvuru yapılabilecek ilan bulunmamaktadır.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Application;