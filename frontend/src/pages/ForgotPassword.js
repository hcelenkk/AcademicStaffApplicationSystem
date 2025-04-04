import React, { useState } from 'react';
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

const ForgotPassword = () => {
  const [tcKimlik, setTcKimlik] = useState('');
  const [eposta, setEposta] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/forgot-password', {
        tc_kimlik: tcKimlik,
        eposta,
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
            Şifremi Unuttum
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            TC Kimlik Numaranızı ve e-posta adresinizi girin. Şifre sıfırlama bağlantısını e-posta adresinize göndereceğiz.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="tcKimlik"
              label="TC Kimlik Numarası"
              name="tcKimlik"
              autoComplete="off"
              value={tcKimlik}
              onChange={(e) => setTcKimlik(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="eposta"
              label="E-posta Adresi"
              name="eposta"
              type="email"
              autoComplete="email"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Şifre Sıfırlama Bağlantısı Gönder
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

export default ForgotPassword;