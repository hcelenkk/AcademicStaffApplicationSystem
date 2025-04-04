import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';

const Login = () => {
  const [tcKimlik, setTcKimlik] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Gönderilen veriler:', { tc_kimlik: tcKimlik, sifre });

    if (!tcKimlik || !sifre) {
      setError('TC Kimlik Numarası ve şifre alanları boş olamaz.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        tc_kimlik: tcKimlik,
        sifre,
      });
      console.log('API yanıtı:', response.data);

      localStorage.setItem('token', response.data.token);
      const userRole = response.data.rol; // role yerine rol
      console.log('Kullanıcı rolü:', userRole);

      if (userRole === 'Admin') {
        navigate('/admin');
      } else if (userRole === 'Aday') {
        navigate('/apply');
      } else {
        setError('Bilinmeyen kullanıcı rolü');
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      console.error('Hata detayları:', err.response?.data);
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Giriş Yap
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
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
            name="sifre"
            label="Şifre"
            type="password"
            id="sifre"
            autoComplete="current-password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Şifremi Unuttum
            </Link>
            <Link component={RouterLink} to="/register" variant="body2">
              Kayıt Ol
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;