import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, roles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: henüz kontrol edilmedi
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Yetkisiz erişim: Token bulunamadı');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn('Token süresi dolmuş:', decoded.exp);
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setUserRole(decoded.rol);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Token decode hatası:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  if (roles && userRole && !roles.includes(userRole)) {
    console.warn(`Yetkisiz erişim: ${userRole} rolü, gerekli rollere (${roles.join(', ')}) sahip değil`);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;