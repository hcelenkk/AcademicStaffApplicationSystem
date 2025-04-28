import React, { useState } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const AddCriterion = ({ setActiveTab }) => {
  const [newCriterion, setNewCriterion] = useState({
    kategori: '',
    aciklama: '',
    min_puan: '',
    max_puan: '',
    aktif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCriterionChange = (e) => {
    setNewCriterion({ ...newCriterion, [e.target.name]: e.target.value });
  };

  const handleCriterionSwitchChange = (e) => {
    setNewCriterion({ ...newCriterion, aktif: e.target.checked });
  };

  const handleAddCriterion = async () => {
    if (!newCriterion.kategori || !newCriterion.aciklama || !newCriterion.min_puan || !newCriterion.max_puan) {
      setError('Tüm kriter alanları doldurulmalıdır.');
      return;
    }
    if (parseInt(newCriterion.min_puan) >= parseInt(newCriterion.max_puan)) {
      setError('Minimum puan, maksimum puandan küçük olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/manager/criteria', newCriterion);
      setSuccess('Kriter başarıyla eklendi!');
      setError('');
      setNewCriterion({ kategori: '', aciklama: '', min_puan: '', max_puan: '', aktif: true });
      setActiveTab('mevcut-kriterler');
    } catch (err) {
      console.error('Kriter eklenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Kriter eklenemedi. Lütfen tekrar deneyin.');
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
          Kriter Yönetimi
        </Typography>
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategori</InputLabel>
            <Select
              name="kategori"
              value={newCriterion.kategori}
              onChange={handleCriterionChange}
              label="Kategori"
            >
              <MenuItem value="">Seçiniz</MenuItem>
              <MenuItem value="Akademik Performans">Akademik Performans</MenuItem>
              <MenuItem value="Deneyim">Deneyim</MenuItem>
              <MenuItem value="Yayınlar">Yayınlar</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Açıklama"
            name="aciklama"
            value={newCriterion.aciklama}
            onChange={handleCriterionChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Minimum Puan"
            name="min_puan"
            type="number"
            value={newCriterion.min_puan}
            onChange={handleCriterionChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Maksimum Puan"
            name="max_puan"
            type="number"
            value={newCriterion.max_puan}
            onChange={handleCriterionChange}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography>Aktif</Typography>
            <Switch
              checked={newCriterion.aktif}
              onChange={handleCriterionSwitchChange}
              name="aktif"
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleAddCriterion}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Kriter Ekle'}
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

export default AddCriterion;