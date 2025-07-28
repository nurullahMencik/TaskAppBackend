const express = require('express');
const router = express.Router();


const { protect } = require('../middlewares/authMiddleware'); 


const { getAllUsers } = require('../controllers/userController');


// Tüm kullanıcıları çekme rotası sadece oturum açmış kullanıcılar erişebilir
router.get('/', protect, getAllUsers);

module.exports = router;
