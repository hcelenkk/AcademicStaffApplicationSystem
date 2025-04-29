import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Header from '../components/Header';
import generatePDF from '../utils/generatePDF';

const Apply = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [appliedAnnouncements, setAppliedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appliedData, setAppliedData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ilanlar');

  useEffect(() => {
    // URL yoluna göre aktif sekmeyi belirle
    if (location.pathname === '/apply') {
      setActiveTab('ilanlar');
    } else if (location.pathname === '/my-applications') {
      setActiveTab('basvurularim');
    } else if (location.pathname === '/notifications') {
      setActiveTab('bildirimler');
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [announcementsResponse, applicationsResponse] = await Promise.all([
          api.get('/announcements').catch((err) => {
            throw new Error(`İlanlar yüklenemedi: ${err.response?.data?.message || err.message}`);
          }),
          api.get('/applications/my-applications').catch((err) => {
            throw new Error(`Başvurular yüklenemedi: ${err.response?.data?.message || err.message}`);
          }),
        ]);
        setAnnouncements(announcementsResponse.data);
        const appliedIds = applicationsResponse.data.map((app) => app.ilan.ilan_id);
        setAppliedAnnouncements(appliedIds);
      } catch (err) {
        console.error('Veriler yüklenemedi:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.pathname]);

  const handleApply = async (ilan_id) => {
    if (appliedAnnouncements.includes(ilan_id)) {
      setError('Bu ilana zaten başvurdunuz!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/applications', { ilan_id });
      setAppliedAnnouncements((prev) => [...prev, ilan_id]);
      const appliedAnn = announcements.find((ann) => ann.ilan_id === ilan_id);
      const applicationData = {
        basvuru_tarihi: new Date().toISOString(),
        durum: response.data.durum || 'Beklemede',
      };
      setAppliedData({ application: applicationData, announcement: appliedAnn });
      await generatePDF(applicationData, appliedAnn);
      setSuccess('Başvuru başarılı! PDF otomatik olarak indirildi.');
      setError('');
      setTimeout(() => {
        setActiveTab('basvurularim');
        navigate('/my-applications');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
      setSuccess('');
      console.error('Başvuru hatası:', err.response?.data || err.message);
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

  const getAnnouncementStatus = (bitis_tarih) => {
    const today = new Date();
    const endDate = new Date(bitis_tarih);
    return endDate >= today ? 'Açık' : 'Kapalı';
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
    setAppliedData(null);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            İlanlar
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={activeTab === 'ilanlar' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('ilanlar');
                navigate('/apply');
              }}
              sx={{
                backgroundColor: activeTab === 'ilanlar' ? '#4CAF50' : 'transparent',
                color: activeTab === 'ilanlar' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'ilanlar' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              İLANLAR
            </Button>
            <Button
              variant={activeTab === 'basvurularim' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('basvurularim');
                navigate('/my-applications');
              }}
              sx={{
                backgroundColor: activeTab === 'basvurularim' ? '#4CAF50' : 'transparent',
                color: activeTab === 'basvurularim' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'basvurularim' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              BAŞVURULARIM
            </Button>
            <Button
              variant={activeTab === 'bildirimler' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('bildirimler');
                navigate('/notifications');
              }}
              sx={{
                backgroundColor: activeTab === 'bildirimler' ? '#4CAF50' : 'transparent',
                color: activeTab === 'bildirimler' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'bildirimler' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              BİLDİRİMLER
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : announcements.length > 0 ? (
            <List>
              {announcements.map((ann) => (
                <ListItem
                  key={ann.ilan_id}
                  secondaryAction={
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApply(ann.ilan_id)}
                      disabled={loading || getAnnouncementStatus(ann.bitis_tarih) !== 'Açık' || appliedAnnouncements.includes(ann.ilan_id)}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Başvur'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`Kategori: ${ann.kategori} - ${ann.aciklama}`}
                    secondary={`Başlangıç: ${formatDate(ann.baslangic_tarih)} - Bitiş: ${formatDate(ann.bitis_tarih)} | Durum: ${getAnnouncementStatus(ann.bitis_tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Şu anda aktif ilan bulunmamaktadır.
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

export default Apply;