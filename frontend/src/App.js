import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Apply from './pages/Apply';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import ManagerPanel from './pages/ManagerPanel';
import JuriPanel from './pages/JuriPanel';
import AdminApplications from './pages/AdminApplications';
import MyApplications from './pages/MyApplications';
import Announcements from './pages/Announcements';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Herkese açık route'lar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* Korumalı route'lar */}
        <Route
          path="/apply"
          element={
            <ProtectedRoute allowedRoles={['Aday']}>
              <Apply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRoles={['Aday']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['Aday']}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-panel"
          element={
            <ProtectedRoute allowedRoles={['Yönetici']}>
              <ManagerPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/juri-panel"
          element={
            <ProtectedRoute allowedRoles={['Jüri']}>
              <JuriPanel />
            </ProtectedRoute>
          }
        />

        {/* Varsayılan route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;