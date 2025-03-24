import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import Header from '../components/Header';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('İlanlar yüklenemedi:', err);
      }
    };
    fetchAnnouncements();
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
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
          İlanlar
        </Typography>
        {announcements.length > 0 ? (
          <List>
            {announcements.map((ann) => (
              <ListItem key={ann.ilan_id}>
                <ListItemText
                  primary={`${ann.kategori} - ${ann.aciklama}`}
                  secondary={`${formatDate(ann.baslangic_tarih)} - ${formatDate(ann.bitis_tarih)}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Henüz ilan yok.</Typography>
        )}
      </Container>
    </>
  );
};

export default Announcements;