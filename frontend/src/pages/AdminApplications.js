import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import Header from '../components/Header';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/admin');
        setApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusChange = async (basvuru_id, newStatus) => {
    setLoading(true);
    try {
      const response = await api.put(`/applications/${basvuru_id}`, { durum: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.basvuru_id === basvuru_id ? { ...app, durum: newStatus } : app))
      );
      alert('Başvuru durumu başarıyla güncellendi!');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Başvuru durumu güncellenemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
      console.error('Başvuru durumu güncelleme hatası:', err);
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
            Başvuru Yönetimi
          </Typography>
          {applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem
                  key={app.basvuru_id}
                  secondaryAction={
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={app.durum}
                        onChange={(e) => handleStatusChange(app.basvuru_id, e.target.value)}
                        disabled={loading}
                      >
                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                        <MenuItem value="Kabul Edildi">Kabul Edildi</MenuItem>
                        <MenuItem value="Reddedildi">Reddedildi</MenuItem>
                      </Select>
                    </FormControl>
                  }
                >
                  <ListItemText
                    primary={`${app.kategori} - ${app.aciklama}`}
                    secondary={`Aday: ${app.ad} ${app.soyad} | Tarih: ${formatDate(app.baslangic_tarih)} - ${formatDate(app.bitis_tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz başvuru yok.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default AdminApplications;