const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.warn('Yetkilendirme başarısız: Token bulunamadı');
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (!decoded.tc_kimlik || !decoded.rol) {
      console.warn('Yetkilendirme başarısız: Token içeriği eksik', { decoded });
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token içeriği' });
    }
    req.user = decoded; // decoded: { tc_kimlik, rol }
    console.log(`Kullanıcı doğrulandı: ${decoded.tc_kimlik}, Rol: ${decoded.rol}`);
    next();
  } catch (err) {
    console.error('Yetkilendirme hatası:', err.message);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }
};

module.exports = authMiddleware;