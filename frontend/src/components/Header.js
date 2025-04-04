import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Token değişimini izlemek için bir event listener ekle
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    // Storage event'ini dinle (farklı sekmelerde token değişimini algılar)
    window.addEventListener('storage', handleStorageChange);

    // İlk render'da token kontrolü
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    // Token'ı temizle
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Login sayfasına yönlendir
    navigate('/login');
  };

  // Eğer kullanıcı oturum açmamışsa, Header'ı gösterme
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Akademik Personel Başvuru Sistemi
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;