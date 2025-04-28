// src/pages/RoleManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  Button,
  Snackbar,
  ListItem,
  ListItemText,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users');
        setUsers(response.data || []);
      } catch (err) {
        console.error('Kullanıcılar yüklenemedi:', err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 404) {
          setError('Kullanıcılar endpoint\'i bulunamadı. Backend yapılandırmasını kontrol edin. ');
        } else {
          setError('Kullanıcılar yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleRoleChange = (user, role) => {
    setSelectedUser(user);
    setNewRole(role);
    setOpenDialog(true);
  };

  const confirmRoleChange = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${selectedUser.tc_kimlik}/role`, { rol: newRole });
      setUsers(users.map(user => user.tc_kimlik === selectedUser.tc_kimlik ? { ...user, rol: newRole } : user));
      setSuccess('Rol başarıyla güncellendi!');
      setError('');
    } catch (err) {
      console.error('Rol güncelleme hatası:', err.response?.data || err.message);
      setError('Rol güncellenemedi. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleSnackbarClose = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Rol Yönetimi</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {users.length > 0 ? (
              <List>
                {users.map(user => (
                  <ListItem key={user.tc_kimlik} secondaryAction={
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={user.rol}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        disabled={loading}
                      >
                        <MenuItem value="Aday">Aday</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Yönetici">Yönetici</MenuItem>
                        <MenuItem value="Jüri">Jüri</MenuItem>
                      </Select>
                    </FormControl>
                  }>
                    <ListItemText primary={`${user.ad} ${user.soyad}`} secondary={`TC: ${user.tc_kimlik}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              !error && (
                <Typography variant="body1" color="text.secondary">
                  Henüz kullanıcı bulunmamaktadır.
                </Typography>
              )
            )}
          </>
        )}
        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Rol Değişikliği Onayı</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedUser && `${selectedUser.ad} ${selectedUser.soyad} adlı kullanıcının rolünü "${newRole}" olarak değiştirmek istediğinizden emin misiniz?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>İptal</Button>
            <Button onClick={confirmRoleChange} autoFocus>Onayla</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
            {success || error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default RoleManagement;