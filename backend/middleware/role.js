const roleMiddleware = (roles) => (req, res, next) => {
    const userRole = req.user?.rol; // "role" yerine "rol"
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Yetkisiz erişim: Bu işlem için gerekli role sahip değilsiniz' });
    }
    next();
  };
  
  module.exports = roleMiddleware;