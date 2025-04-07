import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation ve useNavigate ekliyoruz
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button, // Button bileşenini ekliyoruz
} from '@mui/material';
import Header from '../components/Header';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basvurularim'); // Aktif sekmeyi tutmak için state
  const navigate = useNavigate();
  const location = useLocation(); // Mevcut URL yolunu almak için

  useEffect(() => {
    // URL yoluna göre aktif sekmeyi belirle
    if (location.pathname === '/apply') {
      setActiveTab('ilanlar');
    } else if (location.pathname === '/my-applications') {
      setActiveTab('basvurularim');
    } else if (location.pathname === '/notifications') {
      setActiveTab('bildirimler');
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/my-applications');
        setApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [location.pathname]); // URL değiştiğinde useEffect tekrar çalışır

  const formatDateTime = (isoDate) => {
    if (!isoDate) return 'Tarih belirtilmemiş';
    return new Date(isoDate).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              variant={activeTab === 'ilanlar' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('ilanlar');
                navigate('/apply');
              }}
              sx={{
                backgroundColor: activeTab === 'ilanlar' ? '#4CAF50' : 'transparent',
                color: activeTab === 'ilanlar' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'ilanlar' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              İLANLAR
            </Button>
            <Button
              variant={activeTab === 'basvurularim' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('basvurularim');
                navigate('/my-applications');
              }}
              sx={{
                backgroundColor: activeTab === 'basvurularim' ? '#4CAF50' : 'transparent',
                color: activeTab === 'basvurularim' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'basvurularim' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              BAŞVURULARIM
            </Button>
            <Button
              variant={activeTab === 'bildirimler' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('bildirimler');
                navigate('/notifications');
              }}
              sx={{
                backgroundColor: activeTab === 'bildirimler' ? '#4CAF50' : 'transparent',
                color: activeTab === 'bildirimler' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'bildirimler' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              BİLDİRİMLER
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem key={app.basvuru_id}>
                  <ListItemText
                    primary={`İlan: ${app.ilan.kategori} - ${app.ilan.aciklama}`}
                    secondary={`Durum: ${app.durum} | Puan: ${app.puan !== null ? app.puan : 'Henüz puanlama yapılmadı'} | Başvuru Tarihi: ${formatDateTime(app.olusturulma_tarih)}`}
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
      </Container>
    </>
  );
};

export default MyApplications;