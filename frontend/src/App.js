import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Apply from './pages/Apply';
import MyApplications from './pages/MyApplications';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import AdminApplications from './pages/AdminApplications';
import AddAnnouncement from './pages/AddAnnouncement';
import CurrentAnnouncements from './pages/CurrentAnnouncements';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Announcements from './pages/Announcements';
import Application from './pages/Application';
import JuriPanel from './pages/JuriPanel';
import ManagerPanel from './pages/ManagerPanel';
import AddCriterion from './pages/AddCriterion';
import CurrentCriteria from './pages/CurrentCriteria';
import AddJuri from './pages/AddJuri';
import CurrentJuriMembers from './pages/CurrentJuriMembers';
import AssignJuri from './pages/AssignJuri';
import RoleManagement from './pages/RoleManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* Admin Paneli ve alt rotaları */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route path="add-announcement" element={<AddAnnouncement />} />
          <Route path="current-announcements" element={<CurrentAnnouncements />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="role-management" element={<RoleManagement />} />
        </Route>
        {/* Manager Paneli ve alt rotaları */}
        <Route path="/manager" element={<ManagerPanel />}>
          <Route path="add-criterion" element={<AddCriterion />} />
          <Route path="current-criteria" element={<CurrentCriteria />} />
          <Route path="add-juri" element={<AddJuri />} />
          <Route path="current-juri-members" element={<CurrentJuriMembers />} />
          <Route path="assign-juri" element={<AssignJuri />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/application" element={<Application />} />
        <Route path="/juri-panel" element={<JuriPanel />} />
        <Route path="/manager-panel" element={<ManagerPanel />} />
        {/* Varsayılan rota (isteğe bağlı) */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;