import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Button } from '@mui/material';
import Header from '../components/Header';
import AddCriterion from './AddCriterion';
import CurrentCriteria from './CurrentCriteria';
import AddJuri from './AddJuri';
import CurrentJuriMembers from './CurrentJuriMembers';
import AssignJuri from './AssignJuri';
import api from '../services/api';

const ManagerPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('kriter-yonetimi');
  const [juriMembers, setJuriMembers] = useState([]); // juriMembers state'i burada tanımlı

  useEffect(() => {
    if (location.pathname === '/manager/add-criterion') {
      setActiveTab('kriter-yonetimi');
    } else if (location.pathname === '/manager/current-criteria') {
      setActiveTab('mevcut-kriterler');
    } else if (location.pathname === '/manager/add-juri') {
      setActiveTab('juri-yonetimi');
    } else if (location.pathname === '/manager/current-juri-members') {
      setActiveTab('mevcut-juri-uyeleri');
    } else if (location.pathname === '/manager/assign-juri') {
      setActiveTab('juri-atama');
    } else {
      navigate('/manager/add-criterion'); // Varsayılan olarak Kriter Yönetimi sekmesine yönlendir
    }

    // Jüri üyelerini yükle
    const fetchJuriMembers = async () => {
      try {
        const response = await api.get('/users?rol=Jüri');
        setJuriMembers(response.data);
      } catch (err) {
        console.error('Jüri üyeleri yüklenemedi:', err.response?.data || err.message);
      }
    };
    fetchJuriMembers();
  }, [location.pathname, navigate]);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            <Button
              variant={activeTab === 'kriter-yonetimi' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('kriter-yonetimi');
                navigate('/manager/add-criterion');
              }}
              sx={{
                backgroundColor: activeTab === 'kriter-yonetimi' ? '#4CAF50' : 'transparent',
                color: activeTab === 'kriter-yonetimi' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'kriter-yonetimi' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              KRİTER YÖNETİMİ
            </Button>
            <Button
              variant={activeTab === 'mevcut-kriterler' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('mevcut-kriterler');
                navigate('/manager/current-criteria');
              }}
              sx={{
                backgroundColor: activeTab === 'mevcut-kriterler' ? '#4CAF50' : 'transparent',
                color: activeTab === 'mevcut-kriterler' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'mevcut-kriterler' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              MEVCUT KRİTERLER
            </Button>
            <Button
              variant={activeTab === 'juri-yonetimi' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('juri-yonetimi');
                navigate('/manager/add-juri');
              }}
              sx={{
                backgroundColor: activeTab === 'juri-yonetimi' ? '#4CAF50' : 'transparent',
                color: activeTab === 'juri-yonetimi' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'juri-yonetimi' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              JÜRİ YÖNETİMİ
            </Button>
            <Button
              variant={activeTab === 'mevcut-juri-uyeleri' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('mevcut-juri-uyeleri');
                navigate('/manager/current-juri-members');
              }}
              sx={{
                backgroundColor: activeTab === 'mevcut-juri-uyeleri' ? '#4CAF50' : 'transparent',
                color: activeTab === 'mevcut-juri-uyeleri' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'mevcut-juri-uyeleri' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              MEVCUT JÜRİ ÜYELERİ
            </Button>
            <Button
              variant={activeTab === 'juri-atama' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => {
                setActiveTab('juri-atama');
                navigate('/manager/assign-juri');
              }}
              sx={{
                backgroundColor: activeTab === 'juri-atama' ? '#4CAF50' : 'transparent',
                color: activeTab === 'juri-atama' ? '#fff' : '#000000',
                '&:hover': {
                  backgroundColor: activeTab === 'juri-atama' ? '#45a049' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              JÜRİ ATAMA
            </Button>
          </Box>

          {location.pathname === '/manager/add-criterion' && <AddCriterion setActiveTab={setActiveTab} />}
          {location.pathname === '/manager/current-criteria' && <CurrentCriteria />}
          {location.pathname === '/manager/add-juri' && (
            <AddJuri setActiveTab={setActiveTab} setJuriMembers={setJuriMembers} />
          )}
          {location.pathname === '/manager/current-juri-members' && <CurrentJuriMembers />}
          {location.pathname === '/manager/assign-juri' && <AssignJuri />}
        </Box>
      </Container>
    </>
  );
};

export default ManagerPanel;