import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Doğru import: jwtDecode fonksiyonu
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

const Login = () => {
  const [tcKimlik, setTcKimlik] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        tc_kimlik: tcKimlik,
        sifre,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Token'ı çözerek kullanıcı rolünü al
      const decodedToken = jwtDecode(token); // jwtDecode fonksiyonunu kullanıyoruz
      const userRole = decodedToken.rol;

      // Role göre yönlendirme yap
      switch (userRole) {
        case 'Aday':
          navigate('/apply');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        case 'Yönetici':
          navigate('/manager-panel');
          break;
        case 'Jüri':
          navigate('/juri-panel');
          break;
        default:
          setError('Tanımlı olmayan bir rol. Lütfen sistem yöneticisi ile iletişime geçin.');
      }
    } catch (err) {
      console.error('Giriş hatası:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setError('');
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Giriş Yap
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
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Giriş Yap'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/register" variant="body2">
              Hesabınız yok mu? Kayıt Ol
            </Link>
            <Link href="/forgot-password" variant="body2">
              Şifremi Unuttum
            </Link>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;