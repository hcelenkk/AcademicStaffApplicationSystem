import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

const AssignJuri = () => {
  const [juriMembers, setJuriMembers] = useState([]);
  const [applications, setApplications] = useState([]);
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
        const [juriRes, applicationsRes] = await Promise.all([
          api.get('/users?rol=Jüri'),
          api.get('/applications/admin'),
        ]);
        // Jüri üyelerini kontrol et ve uygun formatta ayarla
        if (!Array.isArray(juriRes.data)) {
          throw new Error('Jüri üyeleri beklenen formatta değil.');
        }
        setJuriMembers(juriRes.data);

        // Başvuruları kontrol et ve uygun formatta ayarla
        if (!Array.isArray(applicationsRes.data)) {
          throw new Error('Başvurular beklenen formatta değil.');
        }
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('Veriler yüklenemedi:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Veriler yüklenemedi. Lütfen tekrar deneyin.'
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      console.error('Jüri atama hatası:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Bilinmeyen bir hata oluştu.';
      const errorDetail = err.response?.data?.error || err.response?.data?.detail || '';
      const missingTcKimliks = err.response?.data?.missingTcKimliks || [];
      let detailedMessage = errorMessage;
      if (missingTcKimliks.length > 0) {
        detailedMessage += ` Eksik jüri üyeleri: ${missingTcKimliks.join(', ')}.`;
      }
      if (errorDetail) {
        detailedMessage += ` (${errorDetail})`;
      }
      setError(`Jüri atama başarısız: ${detailedMessage}`);
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
          Jüri Atama
        </Typography>
        {loading && !applications.length && !juriMembers.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <MenuItem key={app.basvuru_id} value={app.basvuru_id}>
                      {`${app.aday.ad} ${app.aday.soyad} - ${app.ilan.kategori} (${app.durum})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Başvuru bulunamadı</MenuItem>
                )}
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
                {juriMembers.length > 0 ? (
                  juriMembers.map((juri) => (
                    <MenuItem key={juri.tc_kimlik} value={juri.tc_kimlik}>
                      {`${juri.ad} ${juri.soyad} (TC: ${juri.tc_kimlik})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Jüri üyesi bulunamadı</MenuItem>
                )}
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

export default AssignJuri;