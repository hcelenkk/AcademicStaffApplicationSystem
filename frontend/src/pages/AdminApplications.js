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
  TextField,
} from '@mui/material';
import Header from '../components/Header';

const kategoriler = ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'];
const durumlar = ['Beklemede', 'Kabul Edildi', 'Reddedildi'];

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filters, setFilters] = useState({
    kategori: '',
    durum: '',
    adSoyad: '', // Ad ve soyad için tek bir filtre
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/admin');
        setApplications(response.data);
        setFilteredApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (filters.kategori) {
      filtered = filtered.filter((app) => app.ilan.kategori === filters.kategori);
    }
    if (filters.durum) {
      filtered = filtered.filter((app) => app.durum === filters.durum);
    }
    if (filters.adSoyad) {
      const searchTerm = filters.adSoyad.toLowerCase().trim();
      filtered = filtered.filter((app) => {
        const fullName = `${app.aday.ad} ${app.aday.soyad}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
    }

    setFilteredApplications(filtered);
  }, [filters, applications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (basvuru_id, newStatus) => {
    try {
      const response = await api.put(`/applications/${basvuru_id}`, { durum: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app.basvuru_id === basvuru_id ? { ...app, durum: response.data.durum } : app
        )
      );
      setFilteredApplications((prev) =>
        prev.map((app) =>
          app.basvuru_id === basvuru_id ? { ...app, durum: response.data.durum } : app
        )
      );
      alert('Başvuru durumu güncellendi!');
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
      alert('Durum güncellenemedi. Lütfen tekrar deneyin.');
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

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Başvuru Yönetimi
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kategoriye Göre Filtrele</InputLabel>
              <Select
                name="kategori"
                value={filters.kategori}
                onChange={handleFilterChange}
                label="Kategoriye Göre Filtrele"
              >
                <MenuItem value="">Tümü</MenuItem>
                {kategoriler.map((kategori) => (
                  <MenuItem key={kategori} value={kategori}>
                    {kategori}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Duruma Göre Filtrele</InputLabel>
              <Select
                name="durum"
                value={filters.durum}
                onChange={handleFilterChange}
                label="Duruma Göre Filtrele"
              >
                <MenuItem value="">Tümü</MenuItem>
                {durumlar.map((durum) => (
                  <MenuItem key={durum} value={durum}>
                    {durum}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ad Soyad ile Filtrele"
              name="adSoyad"
              value={filters.adSoyad}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            />
          </Box>
          {filteredApplications.length > 0 ? (
            <List>
              {filteredApplications.map((app) => (
                <ListItem
                  key={app.basvuru_id}
                  secondaryAction={
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={app.durum}
                        onChange={(e) => handleStatusChange(app.basvuru_id, e.target.value)}
                        label="Durum"
                      >
                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                        <MenuItem value="Kabul Edildi">Kabul Edildi</MenuItem>
                        <MenuItem value="Reddedildi">Reddedildi</MenuItem>
                      </Select>
                    </FormControl>
                  }
                >
                  <ListItemText
                    primary={`Aday: ${app.aday?.ad || 'Bilinmiyor'} ${app.aday?.soyad || 'Bilinmiyor'}`}
                    secondary={`İlan: ${app.ilan?.kategori || 'Bilinmiyor'} - ${app.ilan?.aciklama || 'Açıklama yok'} | Başvuru Tarihi: ${formatDate(app.basvuru_tarih)} | Durum: ${app.durum}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Filtrelenen kriterlere uygun başvuru yok.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default AdminApplications;