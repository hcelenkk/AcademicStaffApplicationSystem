import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

const ResetPassword = () => {
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Şifrelerin eşleşip eşleşmediğini kontrol et
    if (sifre !== sifreTekrar) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { sifre });
      setSuccess('Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz.');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Şifre sıfırlama başarısız. Lütfen tekrar deneyin.';
      setError(errorMessage);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Şifre Sıfırla
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
            label="Yeni Şifre (Tekrar)"
            type="password"
            id="sifreTekrar"
            value={sifreTekrar}
            onChange={(e) => setSifreTekrar(e.target.value)}
            error={!!error && error.includes('eşleşmiyor')}
            helperText={error.includes('eşleşmiyor') ? error : ''}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Şifreyi Sıfırla'}
          </Button>
        </Box>
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
  );
};

export default ResetPassword;