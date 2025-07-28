const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');


const { getAllLogs, getLogsByTaskId } = require('../controllers/logController');

router.get('/', protect, getAllLogs);

// Belirli bir göreve ait logları getir
// protect middleware'ini doğrudan kullan. Rol kontrolünü getLogsByTaskId içinde zaten yapıyoruz
router.get('/task/:taskId', protect, getLogsByTaskId);

module.exports = router;