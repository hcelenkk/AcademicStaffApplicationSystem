const roleMiddleware = (roles) => (req, res, next) => {
    const userRole = req.user?.rol;
  
    if (!userRole) {
      console.warn('Yetkisiz erişim: Kullanıcı rolü bulunamadı', { user: req.user });
      return res.status(403).json({ message: 'Yetkisiz erişim: Kullanıcı rolü bulunamadı' });
    }
  
    if (!roles.includes(userRole)) {
      console.warn(`Yetkisiz erişim: ${userRole} rolü, gerekli rollere (${roles.join(', ')}) sahip değil`);
      return res.status(403).json({
        message: `Yetkisiz erişim: Bu işlem için gerekli role sahip değilsiniz. Gerekli roller: ${roles.join(', ')}`,
      });
    }
  
    console.log(`Rol doğrulama başarılı: ${userRole}`);
    next();
  };
  
  module.exports = roleMiddleware;