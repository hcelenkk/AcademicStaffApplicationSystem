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
  Switch,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import Header from '../components/Header';

const ManagerPanel = () => {
  const [criteria, setCriteria] = useState([]);
  const [juriMembers, setJuriMembers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newCriterion, setNewCriterion] = useState({
    kategori: '',
    aciklama: '',
    min_puan: '',
    max_puan: '',
    aktif: true,
  });
  const [editCriterion, setEditCriterion] = useState(null);
  const [newJuri, setNewJuri] = useState({
    tc_kimlik: '',
    ad: '',
    soyad: '',
    eposta: '',
  });
  const [assignment, setAssignment] = useState({
    basvuru_id: '',
    juriTcKimliks: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [criteriaRes, juriRes, applicationsRes] = await Promise.all([
          api.get('/manager/criteria'),
          api.get('/users?rol=Jüri'),
          api.get('/applications/admin'),
        ]);
        setCriteria(criteriaRes.data);
        setJuriMembers(juriRes.data);
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('Veriler yüklenemedi:', err.response?.data || err.message);
        setError('Veriler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      setCriteria([...criteria, response.data]);
      setSuccess('Kriter başarıyla eklendi!');
      setError('');
      setNewCriterion({ kategori: '', aciklama: '', min_puan: '', max_puan: '', aktif: true });
    } catch (err) {
      console.error('Kriter eklenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Kriter eklenemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

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

  const handleJuriChange = (e) => {
    setNewJuri({ ...newJuri, [e.target.name]: e.target.value });
  };

  const handleAddJuri = async () => {
    // TC Kimlik numarasını temizle ve string'e çevir
    const cleanedTcKimlik = String(newJuri.tc_kimlik).trim();
  
    // 11 haneli ve yalnızca rakamlardan oluştuğunu kontrol et
    if (!cleanedTcKimlik || !/^\d{11}$/.test(cleanedTcKimlik)) {
      setError('Lütfen geçerli bir 11 haneli TC Kimlik Numarası girin.');
      return;
    }
  
    if (!newJuri.ad || !newJuri.soyad || !newJuri.eposta) {
      setError('Tüm jüri bilgileri doldurulmalıdır.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newJuri.eposta)) {
      setError('Geçersiz e-posta formatı.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await api.post('/manager/juri', { ...newJuri, tc_kimlik: cleanedTcKimlik });
      setJuriMembers([...juriMembers, response.data]);
      setSuccess('Jüri üyesi başarıyla eklendi!');
      setError('');
      setNewJuri({ tc_kimlik: '', ad: '', soyad: '', eposta: '' });
    } catch (err) {
      console.error('Jüri eklenemedi:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Jüri eklenemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };
  const handleAssignmentChange = (e) => {
    setAssignment({ ...assignment, [e.target.name]: e.target.value });
  };

  const handleAssignJuri = async () => {
    if (!assignment.basvuru_id || assignment.juriTcKimliks.length === 0) {
      setError('Lütfen bir başvuru ve en az bir jüri üyesi seçin.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/manager/application-juri', assignment);
      setSuccess('Jüri üyeleri başarıyla atandı!');
      setError('');
      setAssignment({ basvuru_id: '', juriTcKimliks: [] });
    } catch (err) {
      console.error('Jüri atama hatası:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Jüri atama başarısız. Lütfen tekrar deneyin.');
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
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Yönetici Paneli
          </Typography>

          <Typography variant="h5" gutterBottom>
            Kriter Yönetimi
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Kategori"
              name="kategori"
              value={newCriterion.kategori}
              onChange={handleCriterionChange}
              fullWidth
              margin="normal"
            />
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

          <Typography variant="h6" gutterBottom>
            Mevcut Kriterler
          </Typography>
          {criteria.length > 0 ? (
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

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Jüri Yönetimi
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              label="TC Kimlik Numarası"
              name="tc_kimlik"
              value={newJuri.tc_kimlik}
              onChange={handleJuriChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Ad"
              name="ad"
              value={newJuri.ad}
              onChange={handleJuriChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Soyad"
              name="soyad"
              value={newJuri.soyad}
              onChange={handleJuriChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="E-posta"
              name="eposta"
              value={newJuri.eposta}
              onChange={handleJuriChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleAddJuri}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Jüri Ekle'}
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            Mevcut Jüri Üyeleri
          </Typography>
          {juriMembers.length > 0 ? (
            <List>
              {juriMembers.map((juri) => (
                <ListItem key={juri.tc_kimlik}>
                  <ListItemText
                    primary={`${juri.ad} ${juri.soyad}`}
                    secondary={`E-posta: ${juri.eposta} | TC Kimlik: ${juri.tc_kimlik}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz jüri üyesi eklenmemiş.
            </Typography>
          )}

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Jüri Atama
          </Typography>
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Başvuru Seç</InputLabel>
              <Select
                name="basvuru_id"
                value={assignment.basvuru_id}
                onChange={handleAssignmentChange}
                label="Başvuru Seç"
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {applications.map((app) => (
                  <MenuItem key={app.basvuru_id} value={app.basvuru_id}>
                    {`${app.aday.ad} ${app.aday.soyad} - ${app.ilan.kategori}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Jüri Üyeleri Seç</InputLabel>
              <Select
                name="juriTcKimliks"
                multiple
                value={assignment.juriTcKimliks}
                onChange={handleAssignmentChange}
                label="Jüri Üyeleri Seç"
              >
                {juriMembers.map((juri) => (
                  <MenuItem key={juri.tc_kimlik} value={juri.tc_kimlik}>
                    {`${juri.ad} ${juri.soyad}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAssignJuri}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Jüri Ata'}
            </Button>
          </Box>
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

export default ManagerPanel;