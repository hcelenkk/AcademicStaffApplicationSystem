import React, { useState } from 'react';
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

const AddJuri = ({ setActiveTab, setJuriMembers }) => {
  const [newJuri, setNewJuri] = useState({
    tc_kimlik: '',
    ad: '',
    soyad: '',
    eposta: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJuriChange = (e) => {
    setNewJuri({ ...newJuri, [e.target.name]: e.target.value });
  };

  const handleAddJuri = async () => {
    if (!newJuri.tc_kimlik || !newJuri.ad || !newJuri.soyad || !newJuri.eposta) {
      setError('Tüm jüri bilgileri doldurulmalıdır.');
      return;
    }
    if (!/^\d{11}$/.test(newJuri.tc_kimlik)) {
      setError('TC Kimlik Numarası 11 haneli ve yalnızca rakamlardan oluşmalıdır.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newJuri.eposta)) {
      setError('Geçersiz e-posta formatı.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/manager/juri', {
        ...newJuri,
        // Geçici şifre ekleme (örneğin, backend bunu işleyebilir)
        sifre: 'geciciSifre123', // Backend tarafında güvenli bir şifre oluşturulmalı
      });
      setJuriMembers((prevJuriMembers) => [...prevJuriMembers, response.data]);
      setSuccess('Jüri üyesi başarıyla eklendi! Geçici şifre e-posta ile gönderildi.');
      setError('');
      setNewJuri({ tc_kimlik: '', ad: '', soyad: '', eposta: '' });
      setActiveTab('mevcut-juri-uyeleri');
    } catch (err) {
      console.error('Jüri eklenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Jüri eklenemedi. Lütfen tekrar deneyin.');
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Jüri Yönetimi
        </Typography>
        <Box sx={{ mb: 4 }}>
          <TextField
            label="TC Kimlik Numarası"
            name="tc_kimlik"
            value={newJuri.tc_kimlik}
            onChange={handleJuriChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ad"
            name="ad"
            value={newJuri.ad}
            onChange={handleJuriChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Soyad"
            name="soyad"
            value={newJuri.soyad}
            onChange={handleJuriChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="E-posta"
            name="eposta"
            value={newJuri.eposta}
            onChange={handleJuriChange}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleAddJuri}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Jüri Ekle'}
          </Button>
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
      </Box>
    </Container>
  );
};

export default AddJuri;