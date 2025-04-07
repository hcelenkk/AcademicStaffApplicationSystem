import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import Header from '../components/Header';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

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
                <ListItem key={ann.ilan_id}>
                  <ListItemText
                    primary={`Kategori: ${ann.kategori}`}
                    secondary={`Açıklama: ${ann.aciklama} | Başlangıç: ${formatDate(ann.baslangic_tarih)} | Bitiş: ${formatDate(ann.bitis_tarih)} | Durum: ${getAnnouncementStatus(ann.bitis_tarih)}`}
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
      </Container>
    </>
  );
};

export default Announcements;