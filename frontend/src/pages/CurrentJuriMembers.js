// src/pages/CurrentJuriMembers.js
import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';

const CurrentJuriMembers = () => {
  const [juriMembers, setJuriMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchJuriMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users?rol=Jüri');
        if (!Array.isArray(response.data)) {
          throw new Error('Jüri üyeleri beklenen formatta değil.');
        }
        setJuriMembers(response.data);
      } catch (err) {
        console.error('Jüri üyeleri yüklenemedi:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Jüri üyeleri yüklenemedi. Lütfen tekrar deneyin.'
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJuriMembers();
  }, []);

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mevcut Jüri Üyeleri
        </Typography>
        {loading && !juriMembers.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : juriMembers.length > 0 ? (
          <List>
            {juriMembers.map((juri) => (
              <ListItem key={juri.tc_kimlik}>
                <ListItemText
                  primary={`${juri.ad} ${juri.soyad}`}
                  secondary={`E-posta: ${juri.eposta} | TC Kimlik: ${juri.tc_kimlik}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Henüz jüri üyesi eklenmemiş.
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

export default CurrentJuriMembers;