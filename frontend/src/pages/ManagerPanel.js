import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
} from '@mui/material';
import Header from '../components/Header';

const kadroTipleri = ['Dr. Öğr. Üyesi', 'Doçent', 'Profesör'];

const ManagerPanel = () => {
  const [kriterler, setKriterler] = useState([]);
  const [newKriter, setNewKriter] = useState({
    kategori: '',
    aciklama: '',
    min_puan: '',
    max_puan: '',
    aktif: true,
  });
  const [juriUyeleri, setJuriUyeleri] = useState([]);
  const [newJuri, setNewJuri] = useState({
    tc_kimlik: '',
    ad: '',
    soyad: '',
    email: '',
  });
  const [basvurular, setBasvurular] = useState([]);
  const [selectedBasvuru, setSelectedBasvuru] = useState(null);
  const [selectedJuriUyeleri, setSelectedJuriUyeleri] = useState([]);
  const [puanDetaylari, setPuanDetaylari] = useState(null);

  useEffect(() => {
    const fetchKriterler = async () => {
      try {
        const response = await api.get('/manager/kriterler');
        setKriterler(response.data);
      } catch (err) {
        console.error('Kriterler yüklenemedi:', err);
      }
    };

    const fetchJuriUyeleri = async () => {
      try {
        const response = await api.get('/kullanici?rol=Juri');
        setJuriUyeleri(response.data);
      } catch (err) {
        console.error('Jüri üyeleri yüklenemedi:', err);
      }
    };

    const fetchBasvurular = async () => {
      try {
        const response = await api.get('/applications/admin');
        setBasvurular(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err);
      }
    };

    fetchKriterler();
    fetchJuriUyeleri();
    fetchBasvurular();
  }, []);

  const handleKriterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewKriter({
      ...newKriter,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleJuriChange = (e) => {
    setNewJuri({ ...newJuri, [e.target.name]: e.target.value });
  };

  const handleAddKriter = async () => {
    try {
      const response = await api.post('/manager/kriterler', newKriter);
      setKriterler([...kriterler, response.data]);
      setNewKriter({
        kategori: '',
        aciklama: '',
        min_puan: '',
        max_puan: '',
        aktif: true,
      });
      alert('Kriter eklendi!');
    } catch (err) {
      console.error('Kriter ekleme hatası:', err);
      alert('Kriter eklenemedi.');
    }
  };

  const handleAddJuri = async () => {
    try {
      const response = await api.post('/manager/juri', newJuri);
      setJuriUyeleri([...juriUyeleri, response.data]);
      setNewJuri({ tc_kimlik: '', ad: '', soyad: '', email: '' });
      alert('Jüri üyesi eklendi!');
    } catch (err) {
      console.error('Jüri ekleme hatası:', err);
      alert('Jüri üyesi eklenemedi.');
    }
  };

  const handleSelectBasvuru = (basvuru) => {
    setSelectedBasvuru(basvuru);
    setSelectedJuriUyeleri([]);
    setPuanDetaylari(null);
  };

  const handleJuriSelect = (juri) => {
    if (selectedJuriUyeleri.includes(juri)) {
      setSelectedJuriUyeleri(selectedJuriUyeleri.filter((j) => j !== juri));
    } else if (selectedJuriUyeleri.length < 5) {
      setSelectedJuriUyeleri([...selectedJuriUyeleri, juri]);
    } else {
      alert('En fazla 5 jüri üyesi seçebilirsiniz.');
    }
  };

  const handleJuriAtama = async () => {
    try {
      await api.post('/manager/basvuru-juri', {
        basvuru_id: selectedBasvuru.basvuru_id,
        juri_tcs: selectedJuriUyeleri.map((juri) => juri.tc_kimlik),
      });
      alert('Jüri üyeleri atandı!');
      setSelectedBasvuru(null);
      setSelectedJuriUyeleri([]);
    } catch (err) {
      console.error('Jüri atama hatası:', err);
      alert('Jüri atama başarısız.');
    }
  };

  const handlePuanHesapla = async (basvuru_id) => {
    try {
      const response = await api.post(`/applications/${basvuru_id}/puan-hesapla`);
      setPuanDetaylari(response.data);
      // Başvuru listesini güncelle
      const updatedBasvurular = basvurular.map((basvuru) =>
        basvuru.basvuru_id === basvuru_id
          ? { ...basvuru, puan: response.data.toplam_puan }
          : basvuru
      );
      setBasvurular(updatedBasvurular);
      alert('Puan hesaplandı!');
    } catch (err) {
      console.error('Puan hesaplama hatası:', err);
      alert('Puan hesaplama başarısız.');
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
            Yönetici Paneli
          </Typography>

          {/* Kadro Kriterleri Yönetimi */}
          <Typography variant="h5" gutterBottom>
            Kadro Kriterleri Yönetimi
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Kadro Tipi</InputLabel>
              <Select
                name="kategori"
                value={newKriter.kategori}
                onChange={handleKriterChange}
                label="Kadro Tipi"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {kadroTipleri.map((tip) => (
                  <MenuItem key={tip} value={tip}>
                    {tip}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Açıklama"
              name="aciklama"
              value={newKriter.aciklama}
              onChange={handleKriterChange}
              fullWidth
            />
            <TextField
              label="Minimum Puan"
              name="min_puan"
              type="number"
              value={newKriter.min_puan}
              onChange={handleKriterChange}
              fullWidth
            />
            <TextField
              label="Maksimum Puan"
              name="max_puan"
              type="number"
              value={newKriter.max_puan}
              onChange={handleKriterChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="aktif"
                  checked={newKriter.aktif}
                  onChange={handleKriterChange}
                />
              }
              label="Aktif"
            />
            <Button variant="contained" color="primary" onClick={handleAddKriter}>
              Kriter Ekle
            </Button>
          </Box>

          <List>
            {kriterler.map((kriter) => (
              <ListItem key={kriter.kriter_id}>
                <ListItemText
                  primary={`${kriter.kategori} - ${kriter.aciklama}`}
                  secondary={`Min Puan: ${kriter.min_puan} | Max Puan: ${kriter.max_puan} | Aktif: ${kriter.aktif ? 'Evet' : 'Hayır'}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Jüri Üyesi Ekleme */}
          <Typography variant="h5" gutterBottom>
            Jüri Üyesi Ekleme
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="TC Kimlik Numarası"
              name="tc_kimlik"
              value={newJuri.tc_kimlik}
              onChange={handleJuriChange}
              fullWidth
            />
            <TextField
              label="Ad"
              name="ad"
              value={newJuri.ad}
              onChange={handleJuriChange}
              fullWidth
            />
            <TextField
              label="Soyad"
              name="soyad"
              value={newJuri.soyad}
              onChange={handleJuriChange}
              fullWidth
            />
            <TextField
              label="E-posta"
              name="email"
              value={newJuri.email}
              onChange={handleJuriChange}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleAddJuri}>
              Jüri Üyesi Ekle
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Jüri Atama ve Puan Hesaplama */}
          <Typography variant="h5" gutterBottom>
            Başvuru Yönetimi
          </Typography>
          <Typography variant="h6" gutterBottom>
            Başvurular
          </Typography>
          <List>
            {basvurular.map((basvuru) => (
              <ListItem
                key={basvuru.basvuru_id}
                button
                onClick={() => handleSelectBasvuru(basvuru)}
              >
                <ListItemText
                  primary={`Aday: ${basvuru.aday.ad} ${basvuru.aday.soyad}`}
                  secondary={`İlan: ${basvuru.ilan.kategori} - ${basvuru.ilan.aciklama} | Durum: ${basvuru.durum} | Başvuru Tarihi: ${formatDate(basvuru.basvuru_tarih)} | Puan: ${basvuru.puan || 'Hesaplanmadı'}`}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePuanHesapla(basvuru.basvuru_id);
                  }}
                >
                  Puan Hesapla
                </Button>
              </ListItem>
            ))}
          </List>

          {selectedBasvuru && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Jüri Üyeleri Seç
              </Typography>
              <List>
                {juriUyeleri.map((juri) => (
                  <ListItem
                    key={juri.tc_kimlik}
                    button
                    onClick={() => handleJuriSelect(juri)}
                    selected={selectedJuriUyeleri.includes(juri)}
                  >
                    <ListItemText primary={`${juri.ad} ${juri.soyad}`} />
                    {selectedJuriUyeleri.includes(juri) && (
                      <Chip label="Seçildi" color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={handleJuriAtama}
                disabled={selectedJuriUyeleri.length === 0}
              >
                Jüriyi Ata
              </Button>
            </Box>
          )}

          {puanDetaylari && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Puanlama Detayları
              </Typography>
              <Typography variant="body1">
                Toplam Puan: {puanDetaylari.toplam_puan}
              </Typography>
              <List>
                {puanDetaylari.detaylar.map((detay) => (
                  <ListItem key={detay.kriter_id}>
                    <ListItemText
                      primary={detay.aciklama}
                      secondary={`Verilen Puan: ${detay.verilen_puan}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ManagerPanel;