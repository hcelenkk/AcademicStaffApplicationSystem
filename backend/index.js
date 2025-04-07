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

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/manager', managerRoutes);
app.use('/juri', juriRoutes);
app.use('/kullanici', userRoutes);
app.use('/announcements', announcementRoutes);

// Genel hata yönetimi middleware'i
app.use((err, req, res, next) => {
  console.error('Genel hata:', err.message);
  res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});