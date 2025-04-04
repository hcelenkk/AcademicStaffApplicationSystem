import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Apply from './pages/Apply';
import AdminPanel from './pages/AdminPanel';
import MyApplications from './pages/MyApplications';
import AdminApplications from './pages/AdminApplications';
import ManagerPanel from './pages/ManagerPanel'; // Yeni eklenen sayfa
import JuriPanel from './pages/JuriPanel'; // Yeni eklenen sayfa
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/apply"
          element={
            <PrivateRoute roles={['Aday']}>
              <Apply />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['Admin']}>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <PrivateRoute roles={['Aday']}>
              <MyApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <PrivateRoute roles={['Admin']}>
              <AdminApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manager"
          element={
            <PrivateRoute roles={['Yonetici']}>
              <ManagerPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/juri"
          element={
            <PrivateRoute roles={['Juri']}>
              <JuriPanel />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;