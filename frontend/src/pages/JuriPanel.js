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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Header from '../components/Header';

const JuriPanel = () => {
  const [basvurular, setBasvurular] = useState([]);
  const [selectedBasvuru, setSelectedBasvuru] = useState(null);
  const [belgeler, setBelgeler] = useState([]);
  const [degerlendirme, setDegerlendirme] = useState({
    rapor_dosyasi: '',
    sonuc: 'İnceleniyor',
  });

  useEffect(() => {
    const fetchBasvurular = async () => {
      try {
        const response = await api.get('/juri/basvurular');
        setBasvurular(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err);
      }
    };
    fetchBasvurular();
  }, []);

  const handleSelectBasvuru = async (basvuru) => {
    setSelectedBasvuru(basvuru);
    try {
      const response = await api.get(`/juri/basvuru/${basvuru.basvuru_id}/belgeler`);
      setBelgeler(response.data);
    } catch (err) {
      console.error('Belgeler yüklenemedi:', err);
    }
  };

  const handleDegerlendirmeChange = (e) => {
    setDegerlendirme({ ...degerlendirme, [e.target.name]: e.target.value });
  };

  const handleDegerlendirmeSubmit = async () => {
    try {
      await api.post('/juri/degerlendirme', {
        basvuru_id: selectedBasvuru.basvuru_id,
        rapor_dosyasi: degerlendirme.rapor_dosyasi,
        sonuc: degerlendirme.sonuc,
      });
      alert('Değerlendirme kaydedildi!');
      setDegerlendirme({ rapor_dosyasi: '', sonuc: 'İnceleniyor' });
      setSelectedBasvuru(null);
      setBelgeler([]);
    } catch (err) {
      console.error('Değerlendirme hatası:', err);
      alert('Değerlendirme kaydedilemedi.');
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
            Jüri Paneli
          </Typography>

          {/* Başvuru Listesi */}
          <Typography variant="h5" gutterBottom>
            Değerlendirmem Gereken Başvurular
          </Typography>
          {basvurular.length > 0 ? (
            <List>
              {basvurular.map((basvuru) => (
                <ListItem
                  key={basvuru.basvuru_id}
                  button
                  onClick={() => handleSelectBasvuru(basvuru)}
                >
                  <ListItemText
                    primary={`Aday: ${basvuru.aday.ad} ${basvuru.aday.soyad}`}
                    secondary={`İlan: ${basvuru.ilan.kategori} - ${basvuru.ilan.aciklama} | Durum: ${basvuru.durum} | Başvuru Tarihi: ${formatDate(basvuru.basvuru_tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Değerlendirmeniz gereken başvuru bulunmamaktadır.
            </Typography>
          )}

          {/* Seçili Başvuru Detayları */}
          {selectedBasvuru && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Başvuru Detayları
              </Typography>
              <Typography variant="body1">
                Aday: {selectedBasvuru.aday.ad} {selectedBasvuru.aday.soyad}
              </Typography>
              <Typography variant="body1">
                İlan: {selectedBasvuru.ilan.kategori} - {selectedBasvuru.ilan.aciklama}
              </Typography>
              <Typography variant="body1">
                Durum: {selectedBasvuru.durum}
              </Typography>
              <Typography variant="body1">
                Puan: {selectedBasvuru.puan || 'Hesaplanmadı'}
              </Typography>

              {/* Belgeler */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Yüklenen Belgeler
              </Typography>
              {belgeler.length > 0 ? (
                <List>
                  {belgeler.map((belge) => (
                    <ListItem key={belge.belge_id}>
                      <ListItemText
                        primary={`Tür: ${belge.tur}`}
                        secondary={`Yükleme Tarihi: ${formatDate(belge.yukleme_tarih)} | Dosya: ${belge.dosya_yolu}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Yüklenmiş belge bulunmamaktadır.
                </Typography>
              )}

              {/* Değerlendirme Formu */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Değerlendirme Yap
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Rapor Dosyası (URL veya Dosya Yolu)"
                  name="rapor_dosyasi"
                  value={degerlendirme.rapor_dosyasi}
                  onChange={handleDegerlendirmeChange}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Sonuç</InputLabel>
                  <Select
                    name="sonuc"
                    value={degerlendirme.sonuc}
                    onChange={handleDegerlendirmeChange}
                    label="Sonuç"
                  >
                    <MenuItem value="İnceleniyor">İnceleniyor</MenuItem>
                    <MenuItem value="Olumlu">Olumlu</MenuItem>
                    <MenuItem value="Olumsuz">Olumsuz</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDegerlendirmeSubmit}
                >
                  Değerlendirmeyi Kaydet
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default JuriPanel;