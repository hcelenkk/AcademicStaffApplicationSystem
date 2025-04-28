// src/pages/Announcements.js
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
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import Header from '../components/Header';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await api.get('/announcements', { timeout: 10000 });
        setAnnouncements(response.data || []);
        setError('');
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err.response?.data || err.message);
        if (err.code === 'ECONNABORTED') {
          setError('Sunucuya ulaşılamadı. Lütfen backend sunucusunun çalıştığından emin olun.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Yetkisiz erişim. Lütfen giriş yapın.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 404) {
          setError('İlanlar endpoint\'i bulunamadı. Backend yapılandırmasını kontrol edin.');
        } else {
          setError('İlanlar yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [navigate]);

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
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {announcements.length > 0 ? (
                <List>
                  {announcements.map((ann) => (
                    <ListItem key={ann.ilan_id} divider>
                      <ListItemText
                        primary={`Kategori: ${ann.kategori}`}
                        secondary={
                          <>
                            Açıklama: {ann.aciklama} | Başlangıç: {formatDate(ann.baslangic_tarih)} | Bitiş: {formatDate(ann.bitis_tarih)} | Durum: <Chip label={getAnnouncementStatus(ann.bitis_tarih)} color={getAnnouncementStatus(ann.bitis_tarih) === 'Açık' ? 'success' : 'default'} size="small" />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                !error && (
                  <Typography variant="body1" color="text.secondary">
                    Şu anda aktif ilan bulunmamaktadır.
                  </Typography>
                )
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Announcements;