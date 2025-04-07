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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Header from '../components/Header';

const JuriPanel = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [evaluation, setEvaluation] = useState({
    rapor: '',
    sonuc: 'Kabul Edildi',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/juri/applications');
        setApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err.response?.data || err.message);
        setError('Başvurular yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    setDocuments([]);
    try {
      setLoading(true);
      const response = await api.get(`/juri/application/${application.basvuru_id}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Belgeler yüklenemedi:', err.response?.data || err.message);
      setError('Belgeler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (e) => {
    setEvaluation({ ...evaluation, [e.target.name]: e.target.value });
  };

  const handleEvaluationSubmit = async () => {
    if (!evaluation.rapor.trim()) {
      setError('Rapor alanı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/juri/evaluation', {
        basvuru_id: selectedApplication.basvuru_id,
        rapor: evaluation.rapor,
        sonuc: evaluation.sonuc,
      });
      setSuccess('Değerlendirme başarıyla kaydedildi!');
      setError('');
      setEvaluation({ rapor: '', sonuc: 'Kabul Edildi' });
      setSelectedApplication(null);
      setDocuments([]);
      const response = await api.get('/juri/applications');
      setApplications(response.data);
    } catch (err) {
      console.error('Değerlendirme hatası:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Değerlendirme kaydedilemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
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

          <Typography variant="h5" gutterBottom>
            Değerlendirmem Gereken Başvurular
          </Typography>
          {loading && !applications.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : applications.length > 0 ? (
            <List>
              {applications.map((application) => (
                <ListItem
                  key={application.basvuru_id}
                  button
                  onClick={() => handleSelectApplication(application)}
                  selected={selectedApplication?.basvuru_id === application.basvuru_id}
                >
                  <ListItemText
                    primary={`Aday: ${application.ad} ${application.soyad}`}
                    secondary={`İlan: ${application.kategori} - ${application.aciklama} | Durum: ${application.durum} | Başvuru Tarihi: ${formatDate(application.olusturulma_tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Değerlendirmeniz gereken başvuru bulunmamaktadır.
            </Typography>
          )}

          {selectedApplication && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Başvuru Detayları
              </Typography>
              <Typography variant="body1">
                Aday: {selectedApplication.ad} {selectedApplication.soyad}
              </Typography>
              <Typography variant="body1">
                İlan: {selectedApplication.kategori} - {selectedApplication.aciklama}
              </Typography>
              <Typography variant="body1">
                Durum: {selectedApplication.durum}
              </Typography>
              <Typography variant="body1">
                Puan: {selectedApplication.puan !== null ? selectedApplication.puan : 'Puanlama yapılmamış'}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Belgeler
              </Typography>
              {loading && !documents.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress />
                </Box>
              ) : documents.length > 0 ? (
                <List>
                  {documents.map((doc) => (
                    <ListItem key={doc.belge_id}>
                      <ListItemText
                        primary={`Belge Türü: ${doc.turi}`}
                        secondary={`Yükleme Tarihi: ${formatDate(doc.yukleme_tarih)} | Dosya Yolu: ${doc.dosya_yolu}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Bu başvuruya ait belge bulunmamaktadır.
                </Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Değerlendirme Yap
              </Typography>
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  label="Rapor (Dosya Yolu veya Açıklama)"
                  name="rapor"
                  value={evaluation.rapor}
                  onChange={handleEvaluationChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sonuç</InputLabel>
                  <Select
                    name="sonuc"
                    value={evaluation.sonuc}
                    onChange={handleEvaluationChange}
                    label="Sonuç"
                  >
                    <MenuItem value="Kabul Edildi">Kabul Edildi</MenuItem>
                    <MenuItem value="Reddedildi">Reddedildi</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEvaluationSubmit}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Değerlendirmeyi Kaydet'}
                </Button>
              </Box>
            </Box>
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

export default JuriPanel;