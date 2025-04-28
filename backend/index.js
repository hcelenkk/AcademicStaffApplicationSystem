// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const managerRoutes = require('./routes/manager');
const juriRoutes = require('./routes/juri');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/juri', juriRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

// Genel hata yönetimi middleware'i
app.use((err, req, res, next) => {
  console.error('Genel hata:', err.stack);
  res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});