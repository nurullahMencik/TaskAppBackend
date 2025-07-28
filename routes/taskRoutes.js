const express = require('express');
const {
    getTaskById,
    updateTask,
    deleteTask,
    getTaskLogs 
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Belirli bir görevi getirme, güncelleme, silme
router
    .route('/:id')
    .get(protect, getTaskById)
    .put(protect, updateTask) // Yetkilendirme controller içinde daha detaylı
    .delete(protect, authorizeRoles('admin', 'manager'), deleteTask); // Admin ve manager silebilir

// Görev loglarını getirme 
router.get(
    '/:id/logs',
    protect,
    getTaskLogs
);

module.exports = router;