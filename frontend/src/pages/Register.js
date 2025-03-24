import React, { useState } from 'react';
import api from '../services/api';
import { TextField, Button, Container, Typography, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    tc_kimlik: '',
    sifre: '',
    ad: '',
    soyad: '',
    rol: 'Aday',
    eposta: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      alert('Kayıt başarılı!');
      console.log(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Bilinmeyen bir hata oluştu';
      alert('Kayıt başarısız: ' + errorMessage);
      console.error('Hata:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kayıt Ol
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="TC Kimlik No"
            name="tc_kimlik"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre"
            name="sifre"
            type="password"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Ad"
            name="ad"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Soyad"
            name="soyad"
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select name="rol" value={formData.rol} onChange={handleChange}>
              <MenuItem value="Aday">Aday</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Yönetici">Yönetici</MenuItem>
              <MenuItem value="Jüri">Jüri</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            label="E-posta"
            name="eposta"
            type="email"
            onChange={handleChange}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Kayıt Ol
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;