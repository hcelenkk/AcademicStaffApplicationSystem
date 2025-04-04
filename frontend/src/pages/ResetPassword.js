import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import Header from '../components/Header';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Geçersiz veya eksik token. Lütfen şifre sıfırlama bağlantısını kontrol edin.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sifre !== sifreTekrar) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        sifre,
      });
      setSuccess(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
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
      <Container maxWidth="xs">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Şifre Sıfırlama
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Yeni şifrenizi girin.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="sifre"
              label="Yeni Şifre"
              type="password"
              id="sifre"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="sifreTekrar"
              label="Yeni Şifreyi Tekrar Girin"
              type="password"
              id="sifreTekrar"
              value={sifreTekrar}
              onChange={(e) => setSifreTekrar(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!token}
            >
              Şifreyi Güncelle
            </Button>
          </Box>
        </Box>

        {/* Bildirimler */}
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

export default ResetPassword;