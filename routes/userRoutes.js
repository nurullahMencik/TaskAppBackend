// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Sadece protect'i authMiddleware'dan import ediyoruz
const { protect } = require('../middlewares/authMiddleware'); // DİKKAT: 'middlewares' değil, 'middleware' olmalı


const { getAllUsers } = require('../controllers/userController');


// Tüm kullanıcıları çekme rotası (sadece oturum açmış kullanıcılar erişebilir, rol kontrolü yok)
// Rol kontrolü yapılmayacağı için sadece 'protect' middleware'ı yeterli.
router.get('/', protect, getAllUsers);

module.exports = router;