import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import logo from '../assets/Kouyenilogo.png'; // Doğru dosya adını kontrol et

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#006633' }}>
      <Toolbar>
        <img
          src={logo}
          alt="Kocaeli Üniversitesi Logo"
          style={{ height: '40px', marginRight: '10px' }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: '#1A2526', fontWeight: 'bold' }}
        >
          Akademik Personel Başvuru Sistemi
        </Typography>
        {user && (
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ backgroundColor: '#006633', color: '#1A2526', '&:hover': { backgroundColor: '#004d29' } }}
          >
            Çıkış Yap
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;