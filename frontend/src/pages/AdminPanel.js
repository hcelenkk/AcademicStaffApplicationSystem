import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Header from '../components/Header';

const AdminPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    kategori: '',
    aciklama: '',
    baslangic_tarih: '',
    bitis_tarih: '',
    kriter_json: '',
  });
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err.response?.data || err.message);
        setError('İlanlar yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleAnnouncementChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const handleAddAnnouncement = async () => {
    if (
      !newAnnouncement.kategori ||
      !newAnnouncement.aciklama ||
      !newAnnouncement.baslangic_tarih ||
      !newAnnouncement.bitis_tarih
    ) {
      setError('Tüm zorunlu alanlar doldurulmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/announcements', newAnnouncement);
      setAnnouncements([...announcements, response.data]);
      setSuccess('İlan başarıyla eklendi!');
      setError('');
      setNewAnnouncement({ kategori: '', aciklama: '', baslangic_tarih: '', bitis_tarih: '', kriter_json: '' });
    } catch (err) {
      console.error('İlan eklenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'İlan eklenemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditAnnouncement(announcement);
  };

  const handleUpdateAnnouncement = async () => {
    if (
      !editAnnouncement.kategori ||
      !editAnnouncement.aciklama ||
      !editAnnouncement.baslangic_tarih ||
      !editAnnouncement.bitis_tarih
    ) {
      setError('Tüm zorunlu alanlar doldurulmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/announcements/${editAnnouncement.ilan_id}`, editAnnouncement);
      setAnnouncements(
        announcements.map((ann) => (ann.ilan_id === editAnnouncement.ilan_id ? response.data : ann))
      );
      setSuccess('İlan başarıyla güncellendi!');
      setError('');
      setEditAnnouncement(null);
    } catch (err) {
      console.error('İlan güncellenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'İlan güncellenemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (ilan_id) => {
    setLoading(true);
    try {
      await api.delete(`/announcements/${ilan_id}`);
      setAnnouncements(announcements.filter((ann) => ann.ilan_id !== ilan_id));
      setSuccess('İlan başarıyla silindi!');
      setError('');
    } catch (err) {
      console.error('İlan silinemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'İlan silinemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Tarih belirtilmemiş';
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Paneli - İlan Yönetimi
          </Typography>

          <Typography variant="h5" gutterBottom>
            Yeni İlan Ekle
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Kategori"
              name="kategori"
              value={newAnnouncement.kategori}
              onChange={handleAnnouncementChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Açıklama"
              name="aciklama"
              value={newAnnouncement.aciklama}
              onChange={handleAnnouncementChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Başlangıç Tarihi"
              name="baslangic_tarih"
              type="date"
              value={newAnnouncement.baslangic_tarih}
              onChange={handleAnnouncementChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Bitiş Tarihi"
              name="bitis_tarih"
              type="date"
              value={newAnnouncement.bitis_tarih}
              onChange={handleAnnouncementChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Kriter JSON (Opsiyonel)"
              name="kriter_json"
              value={newAnnouncement.kriter_json}
              onChange={handleAnnouncementChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleAddAnnouncement}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'İlan Ekle'}
            </Button>
          </Box>

          <Typography variant="h5" gutterBottom>
            Mevcut İlanlar
          </Typography>
          {loading && !announcements.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : announcements.length > 0 ? (
            <List>
              {announcements.map((ann) => (
                <ListItem
                  key={ann.ilan_id}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => handleEditAnnouncement(ann)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAnnouncement(ann.ilan_id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  {editAnnouncement && editAnnouncement.ilan_id === ann.ilan_id ? (
                    <Box sx={{ width: '100%' }}>
                      <TextField
                        label="Kategori"
                        name="kategori"
                        value={editAnnouncement.kategori}
                        onChange={(e) =>
                          setEditAnnouncement({ ...editAnnouncement, kategori: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Açıklama"
                        name="aciklama"
                        value={editAnnouncement.aciklama}
                        onChange={(e) =>
                          setEditAnnouncement({ ...editAnnouncement, aciklama: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Başlangıç Tarihi"
                        name="baslangic_tarih"
                        type="date"
                        value={editAnnouncement.baslangic_tarih}
                        onChange={(e) =>
                          setEditAnnouncement({ ...editAnnouncement, baslangic_tarih: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      <TextField
                        label="Bitiş Tarihi"
                        name="bitis_tarih"
                        type="date"
                        value={editAnnouncement.bitis_tarih}
                        onChange={(e) =>
                          setEditAnnouncement({ ...editAnnouncement, bitis_tarih: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                      <TextField
                        label="Kriter (Opsiyonel)"
                        name="kriter_json"
                        value={editAnnouncement.kriter_json || ''}
                        onChange={(e) =>
                          setEditAnnouncement({ ...editAnnouncement, kriter_json: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleUpdateAnnouncement}
                          disabled={loading}
                        >
                          Kaydet
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditAnnouncement(null)}
                          disabled={loading}
                        >
                          İptal
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={`Kategori: ${ann.kategori}`}
                      secondary={`Açıklama: ${ann.aciklama} | Başlangıç: ${formatDate(ann.baslangic_tarih)} | Bitiş: ${formatDate(ann.bitis_tarih)} | Kriter JSON: ${ann.kriter_json || 'Yok'}`}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz ilan eklenmemiş.
            </Typography>
          )}
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
    </>
  );
};

export default AdminPanel;