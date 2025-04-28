import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { WidthNormal } from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    tc_kimlik: '',
    ad: '',
    soyad: '',
    eposta: '',
    sifre: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ad ve soyad doğrulama
    if (!formData.ad.trim() || !formData.soyad.trim()) {
      setError('Ad ve soyad alanları boş olamaz.');
      return;
    }

    // E-posta doğrulama
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.eposta)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Kayıt hatası:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Kayıt yapılamadı. Lütfen tekrar deneyin.';
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
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kayıt Ol
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="tc_kimlik"
            label="TC Kimlik Numarası"
            name="tc_kimlik"
            autoComplete="off"
            value={formData.tc_kimlik}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="ad"
            label="Ad"
            name="ad"
            autoComplete="given-name"
            value={formData.ad}
            onChange={handleChange}
            error={!!error && error.includes('Ad')}
            helperText={error.includes('Ad') ? error : ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="soyad"
            label="Soyad"
            name="soyad"
            autoComplete="family-name"
            value={formData.soyad}
            onChange={handleChange}
            error={!!error && error.includes('Soyad')}
            helperText={error.includes('Soyad') ? error : ''}
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
            value={formData.eposta}
            onChange={handleChange}
            error={!!error && error.includes('e-posta')}
            helperText={error.includes('e-posta') ? error : ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="sifre"
            label="Şifre"
            type="password"
            id="sifre"
            autoComplete="new-password"
            value={formData.sifre}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Kayıt Ol'}
          </Button>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mb: 2,
          }}>
            <Link href="/login" variant="body2">
              Zaten hesabınız var mı? Giriş Yap
            </Link>
          </Box>

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

export default Register;