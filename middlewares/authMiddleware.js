const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Authorization başlığında Bearer token var mı kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı al
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token'daki ID ile kullanıcıyı bul ve request objesine ekle
            req.user = await User.findById(decoded.id).select('-password'); // Şifreyi dahil etme

            if (!req.user) {
                return res.status(401).json({ message: 'Geçersiz token. Kullanıcı bulunamadı.' });
            }

            next(); // Sonraki middleware'e veya route handler'a geç
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Geçersiz token. Yetkilendirme başarısız.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme tokenı bulunamadı.' });
    }
};

module.exports = { protect };