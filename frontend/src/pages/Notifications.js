// src/pages/Notifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import Header from '../components/Header';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('bildirimler');

  useEffect(() => {
    // URL yoluna göre aktif sekmeyi belirle
    if (location.pathname === '/apply') {
      setActiveTab('ilanlar');
    } else if (location.pathname === '/my-applications') {
      setActiveTab('basvurularim');
    } else if (location.pathname === '/notifications') {
      setActiveTab('bildirimler');
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (err) {
        console.error('Bildirimler yüklenemedi:', err.response?.data || err.message);
        setError('Bildirimler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [location.pathname]);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Tarih belirtilmemiş';
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsRead = async (bildirim_id) => {
    try {
      const response = await api.put(`/notifications/${bildirim_id}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif.bildirim_id === bildirim_id ? { ...notif, okundu: response.data.okundu } : notif
        )
      );
      setSuccess('Bildirim okundu olarak işaretlendi!');
      setError('');
    } catch (err) {
      console.error('Bildirim okundu işaretleme hatası:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Bildirim okundu olarak işaretlenemedi.');
      setSuccess('');
    }
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
            Bildirimler
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
          ) : notifications.length > 0 ? (
            <List>
              {notifications.map((notif) => (
                <ListItem
                  key={notif.bildirim_id}
                  secondaryAction={
                    !notif.okundu && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleMarkAsRead(notif.bildirim_id)}
                      >
                        Okundu
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <>
                        {notif.tur}: {notif.mesaj}{' '}
                        {notif.okundu ? (
                          <Chip label="Okundu" color="success" size="small" />
                        ) : (
                          <Chip label="Okunmamış" color="primary" size="small" />
                        )}
                      </>
                    }
                    secondary={`Tarih: ${formatDate(notif.tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz bir bildiriminiz bulunmamaktadır.
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

export default Notifications;