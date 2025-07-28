const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Kullanıcı adı veya e-posta zaten kullanımda mı kontrol et
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Kullanıcı adı veya e-posta zaten kullanımda.' });
        }

        // Yeni kullanıcı oluştur
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'developer', // Rol belirtilmezse varsayılan 'developer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası. Kayıt yapılamadı.', error: error.message });
    }
};


// POST /api/auth/login

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // E-posta ile kullanıcıyı bul
        const user = await User.findOne({ email });

        // Kullanıcı mevcutsa ve şifre eşleşiyorsa
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası. Giriş yapılamadı.', error: error.message });
    }
};

module.exports = { registerUser, loginUser };