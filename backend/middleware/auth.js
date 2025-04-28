// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Yetkisiz erişim: Token bulunamadı.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // { tc_kimlik, rol }
    next();
  } catch (err) {
    console.error('Token doğrulama hatası:', err.message);
    return res.status(403).json({ message: 'Geçersiz token.' });
  }
};

module.exports = authMiddleware;