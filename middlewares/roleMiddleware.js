const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok. (Rol bilgisi eksik)' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Bu işlem için yetkiniz yok. Gerekli roller: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { authorizeRoles };