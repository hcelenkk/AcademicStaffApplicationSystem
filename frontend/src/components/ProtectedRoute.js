import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Doğru import: 'jwt-decode' ve jwtDecode fonksiyonu

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token); // jwtDecode fonksiyonunu kullanıyoruz
    const userRole = decodedToken.rol;

    // Kullanıcının rolü, izin verilen roller arasında değilse login sayfasına yönlendir
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (err) {
    console.error('Token doğrulama hatası:', err.message);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;