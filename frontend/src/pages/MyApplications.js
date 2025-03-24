import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Header from '../components/Header';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications');
        setApplications(response.data);
      } catch (err) {
        console.error('Başvurular yüklenemedi:', err);
      }
    };
    fetchApplications();
  }, []);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Başvurularım
          </Typography>
          {applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem key={app.basvuru_id}>
                  <ListItemText
                    primary={`${app.kategori} - ${app.aciklama}`}
                    secondary={`Durum: ${app.durum} | Tarih: ${formatDate(app.baslangic_tarih)} - ${formatDate(app.bitis_tarih)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Henüz bir başvurunuz bulunmamaktadır.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default MyApplications;