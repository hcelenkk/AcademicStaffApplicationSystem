import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale'; // Türkçe dil desteği
import Header from '../components/Header';



// Sabit kategoriler
const kategoriler = ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'];

const AdminPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    kategori: '',
    baslangic_tarih: null, // Date objesi olarak tutacağız
    bitis_tarih: null, // Date objesi olarak tutacağız
    aciklama: '',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditDateChange = (name, date) => {
    setEditFormData({ ...editFormData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Tarihleri ISO formatına çevir
      const formattedData = {
        ...formData,
        baslangic_tarih: formData.baslangic_tarih
          ? formData.baslangic_tarih.toISOString()
          : '',
        bitis_tarih: formData.bitis_tarih ? formData.bitis_tarih.toISOString() : '',
      };
      const response = await api.post('/announcements', formattedData);
      setAnnouncements((prev) => [...prev, response.data]);
      alert('İlan başarıyla eklendi!');
      setFormData({ kategori: '', baslangic_tarih: null, bitis_tarih: null, aciklama: '' });
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
    setEditFormData({
      ...ann,
      baslangic_tarih: new Date(ann.baslangic_tarih), // String'den Date'e çevir
      bitis_tarih: new Date(ann.bitis_tarih), // String'den Date'e çevir
    });
  };

  const handleUpdate = async (ilan_id) => {
    setLoading(true);
    try {
      // Tarihleri ISO formatına çevir
      const formattedEditData = {
        ...editFormData,
        baslangic_tarih: editFormData.baslangic_tarih
          ? editFormData.baslangic_tarih.toISOString()
          : '',
        bitis_tarih: editFormData.bitis_tarih ? editFormData.bitis_tarih.toISOString() : '',
      };
      const response = await api.put(`/announcements/${ilan_id}`, formattedEditData);
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

          <Button
            variant="contained"
            onClick={() => navigate('/admin/applications')}
            sx={{ mb: 2 }}
          >
            Başvuru Yönetimi
          </Button>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 4 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  label="Kategori"
                  required
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {kategoriler.map((kategori) => (
                    <MenuItem key={kategori} value={kategori}>
                      {kategori}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Başlangıç Tarihi"
                value={formData.baslangic_tarih}
                onChange={(date) => handleDateChange('baslangic_tarih', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" required />
                )}
              />
              <DatePicker
                label="Bitiş Tarihi"
                value={formData.bitis_tarih}
                onChange={(date) => handleDateChange('bitis_tarih', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" required />
                )}
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
          </LocalizationProvider>

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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                      <Box sx={{ width: '100%' }}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Kategori</InputLabel>
                          <Select
                            name="kategori"
                            value={editFormData.kategori}
                            onChange={handleEditChange}
                            label="Kategori"
                          >
                            <MenuItem value="">Seçiniz</MenuItem>
                            {kategoriler.map((kategori) => (
                              <MenuItem key={kategori} value={kategori}>
                                {kategori}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <DatePicker
                          label="Başlangıç Tarihi"
                          value={editFormData.baslangic_tarih}
                          onChange={(date) => handleEditDateChange('baslangic_tarih', date)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth margin="normal" />
                          )}
                        />
                        <DatePicker
                          label="Bitiş Tarihi"
                          value={editFormData.bitis_tarih}
                          onChange={(date) => handleEditDateChange('bitis_tarih', date)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth margin="normal" />
                          )}
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
                    </LocalizationProvider>
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