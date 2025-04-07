import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('rol') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');
      setIsAuthenticated(!!token);
      setUserRole(rol || '');
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setIsAuthenticated(false);
    setUserRole('');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const renderNavigationButtons = () => {
    switch (userRole) {
      case 'Aday':
        return (
          <>
            <Button color="inherit" onClick={() => navigate('/apply')}>
              İlanlar
            </Button>
            <Button color="inherit" onClick={() => navigate('/my-applications')}>
              Başvurularım
            </Button>
          </>
        );
      case 'Admin':
        return (
          <>
            <Button color="inherit" onClick={() => navigate('/admin')}>
              İlan Yönetimi
            </Button>
            <Button color="inherit" onClick={() => navigate('/admin/applications')}>
              Başvuru Yönetimi
            </Button>
          </>
        );
      case 'Yönetici':
        return (
          <Button color="inherit" onClick={() => navigate('/manager')}>
            Yönetici Paneli
          </Button>
        );
      case 'Jüri':
        return (
          <Button color="inherit" onClick={() => navigate('/juri')}>
            Jüri Paneli
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box component="img" src="/Kouyenilogo.png" alt="Logo" sx={{ height: 60, mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Akademik Personel Başvuru Sistemi
        </Typography>
        {renderNavigationButtons()}
        <Button color="inherit" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;