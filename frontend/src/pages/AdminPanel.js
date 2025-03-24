import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Header from '../components/Header';

const AdminPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    kategori: '',
    baslangic_tarih: '',
    bitis_tarih: '',
    aciklama: '',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Yönlendirme için

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/announcements', formData);
      setAnnouncements((prev) => [...prev, response.data]);
      alert('İlan başarıyla eklendi!');
      setFormData({ kategori: '', baslangic_tarih: '', bitis_tarih: '', aciklama: '' });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'İlan eklenemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
      console.error('İlan ekleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ilan_id) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      await api.delete(`/announcements/${ilan_id}`);
      setAnnouncements((prev) => prev.filter((ann) => ann.ilan_id !== ilan_id));
      alert('İlan başarıyla silindi!');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'İlan silinemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
      console.error('İlan silme hatası:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ann) => {
    setEditFormData({ ...ann });
  };

  const handleUpdate = async (ilan_id) => {
    setLoading(true);
    try {
      const response = await api.put(`/announcements/${ilan_id}`, editFormData);
      setAnnouncements((prev) =>
        prev.map((ann) => (ann.ilan_id === ilan_id ? response.data : ann))
      );
      alert('İlan başarıyla güncellendi!');
      setEditFormData(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'İlan güncellenemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
      console.error('İlan güncelleme hatası:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Paneli
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Yeni ilan ekleyin veya mevcut ilanları yönetin.
          </Typography>

          {/* Başvuru Yönetimi Butonu */}
          <Button
            variant="contained"
            onClick={() => navigate('/admin/applications')}
            sx={{ mb: 2 }}
          >
            Başvuru Yönetimi
          </Button>

          {/* İlan Ekleme Formu */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 4 }}>
            <TextField
              label="Kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Başlangıç Tarihi (YYYY-MM-DD)"
              name="baslangic_tarih"
              value={formData.baslangic_tarih}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Bitiş Tarihi (YYYY-MM-DD)"
              name="bitis_tarih"
              value={formData.bitis_tarih}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Açıklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Ekleniyor...' : 'İlan Ekle'}
            </Button>
          </Box>

          {/* Mevcut İlanlar */}
          <Typography variant="h5" component="h2" gutterBottom>
            Mevcut İlanlar
          </Typography>
          {announcements.length > 0 ? (
            <List>
              {announcements.map((ann) => (
                <ListItem
                  key={ann.ilan_id}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEdit(ann)}
                        disabled={loading}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(ann.ilan_id)}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  }
                >
                  {editFormData && editFormData.ilan_id === ann.ilan_id ? (
                    <Box sx={{ width: '100%' }}>
                      <TextField
                        label="Kategori"
                        name="kategori"
                        value={editFormData.kategori}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Başlangıç Tarihi (YYYY-MM-DD)"
                        name="baslangic_tarih"
                        value={editFormData.baslangic_tarih}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Bitiş Tarihi (YYYY-MM-DD)"
                        name="bitis_tarih"
                        value={editFormData.bitis_tarih}
                        onChange={handleEditChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Açıklama"
                        name="aciklama"
                        value={editFormData.aciklama}
                        onChange={handleEditChange}
                        fullWidth
                        multiline
                        rows={2}
                        margin="normal"
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdate(ann.ilan_id)}
                          disabled={loading}
                        >
                          Kaydet
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditFormData(null)}
                          disabled={loading}
                        >
                          İptal
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={`${ann.kategori} - ${ann.aciklama}`}
                      secondary={`${formatDate(ann.baslangic_tarih)} - ${formatDate(ann.bitis_tarih)}`}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz ilan yok.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default AdminPanel;