import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

const CurrentCriteria = () => {
  const [criteria, setCriteria] = useState([]);
  const [editCriterion, setEditCriterion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        setLoading(true);
        const response = await api.get('/manager/criteria');
        setCriteria(response.data);
      } catch (err) {
        console.error('Kriterler yüklenemedi:', err.response?.data || err.message);
        setError('Kriterler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchCriteria();
  }, []);

  const handleEditCriterion = (criterion) => {
    setEditCriterion(criterion);
  };

  const handleUpdateCriterion = async () => {
    if (!editCriterion.kategori || !editCriterion.aciklama || !editCriterion.min_puan || !editCriterion.max_puan) {
      setError('Tüm kriter alanları doldurulmalıdır.');
      return;
    }
    if (parseInt(editCriterion.min_puan) >= parseInt(editCriterion.max_puan)) {
      setError('Minimum puan, maksimum puandan küçük olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/manager/criteria/${editCriterion.kriter_id}`, editCriterion);
      setCriteria(criteria.map((c) => (c.kriter_id === editCriterion.kriter_id ? response.data : c)));
      setSuccess('Kriter başarıyla güncellendi!');
      setError('');
      setEditCriterion(null);
    } catch (err) {
      console.error('Kriter güncellenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Kriter güncellenemedi. Lütfen tekrar deneyin.');
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
          Mevcut Kriterler
        </Typography>
        {loading && !criteria.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : criteria.length > 0 ? (
          <List>
            {criteria.map((criterion) => (
              <ListItem
                key={criterion.kriter_id}
                secondaryAction={
                  <IconButton onClick={() => handleEditCriterion(criterion)}>
                    <Edit />
                  </IconButton>
                }
              >
                {editCriterion && editCriterion.kriter_id === criterion.kriter_id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      label="Kategori"
                      name="kategori"
                      value={editCriterion.kategori}
                      onChange={(e) => setEditCriterion({ ...editCriterion, kategori: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Açıklama"
                      name="aciklama"
                      value={editCriterion.aciklama}
                      onChange={(e) => setEditCriterion({ ...editCriterion, aciklama: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Minimum Puan"
                      name="min_puan"
                      type="number"
                      value={editCriterion.min_puan}
                      onChange={(e) => setEditCriterion({ ...editCriterion, min_puan: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Maksimum Puan"
                      name="max_puan"
                      type="number"
                      value={editCriterion.max_puan}
                      onChange={(e) => setEditCriterion({ ...editCriterion, max_puan: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography>Aktif</Typography>
                      <Switch
                        checked={editCriterion.aktif}
                        onChange={(e) => setEditCriterion({ ...editCriterion, aktif: e.target.checked })}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleUpdateCriterion}
                        disabled={loading}
                      >
                        Kaydet
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditCriterion(null)}
                        disabled={loading}
                      >
                        İptal
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <ListItemText
                    primary={`${criterion.kategori} - ${criterion.aciklama}`}
                    secondary={`Min: ${criterion.min_puan} | Max: ${criterion.max_puan} | Aktif: ${criterion.aktif ? 'Evet' : 'Hayır'}`}
                  />
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Henüz kriter eklenmemiş.
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

export default CurrentCriteria;