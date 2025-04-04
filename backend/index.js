const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const managerRoutes = require('./routes/manager');
const juriRoutes = require('./routes/juri');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements'); // Yeni route'u ekliyoruz

// CORS middleware'ini ekliyoruz
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // OPTIONS metodunu ekliyoruz
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Eğer cookie veya kimlik doğrulama kullanıyorsanız
}));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/manager', managerRoutes);
app.use('/juri', juriRoutes);
app.use('/kullanici', userRoutes);
app.use('/announcements', announcementRoutes); // Yeni route'u ekliyoruz

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});