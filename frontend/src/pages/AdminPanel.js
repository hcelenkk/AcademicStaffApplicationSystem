import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import Header from '../components/Header';
import AddAnnouncement from './AddAnnouncement';
import CurrentAnnouncements from './CurrentAnnouncements';
import AdminApplications from './AdminApplications';
import RoleManagement from './RoleManagement';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('yeni-ilan-ekle');

  useEffect(() => {
    // Yetkilendirme kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.rol !== 'Admin') {
        navigate('/login');
        return;
      }
    } catch (err) {
      console.error('Token çözümleme hatası:', err);
      navigate('/login');
      return;
    }

    // Sekme belirleme
    if (location.pathname === '/admin/add-announcement') {
      setActiveTab('yeni-ilan-ekle');
    } else if (location.pathname === '/admin/current-announcements') {
      setActiveTab('mevcut-ilanlar');
    } else if (location.pathname === '/admin/applications') {
      setActiveTab('basvuru-yonetimi');
    } else if (location.pathname === '/admin/role-management') {
      setActiveTab('rol-yonetimi');
    } else {
      navigate('/admin/add-announcement');
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 'yeni-ilan-ekle') navigate('/admin/add-announcement');
    else if (newValue === 'mevcut-ilanlar') navigate('/admin/current-announcements');
    else if (newValue === 'basvuru-yonetimi') navigate('/admin/applications');
    else if (newValue === 'rol-yonetimi') navigate('/admin/role-management');
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Admin Paneli</Typography>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Yeni İlan Ekle" value="yeni-ilan-ekle" />
            <Tab label="Mevcut İlanlar" value="mevcut-ilanlar" />
            <Tab label="Başvuru Yönetimi" value="basvuru-yonetimi" />
            <Tab label="Rol Yönetimi" value="rol-yonetimi" />
          </Tabs>

          {activeTab === 'yeni-ilan-ekle' && <AddAnnouncement setActiveTab={setActiveTab} />}
          {activeTab === 'mevcut-ilanlar' && <CurrentAnnouncements />}
          {activeTab === 'basvuru-yonetimi' && <AdminApplications setActiveTab={setActiveTab} />}
          {activeTab === 'rol-yonetimi' && <RoleManagement />}
        </Box>
      </Container>
    </>
  );
};

export default AdminPanel;