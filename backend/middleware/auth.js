const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // decoded içinde { tc_kimlik, role } var
    next();
  } catch (err) {
    res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }
};

module.exports = authMiddleware;