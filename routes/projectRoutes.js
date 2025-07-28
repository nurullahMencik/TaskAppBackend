const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const {
    createTask,
    getTasksByProjectId
} = require('../controllers/taskController'); 

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Yeni proje oluşturma
router.post(
    '/',
    protect,
    authorizeRoles('admin', 'manager'),
    createProject
);

// Tüm projeleri getirme
router.get(
    '/',
    protect,
    getProjects
);

// Belirli bir projeyi getirme, güncelleme, silme
router
    .route('/:id')
    .get(protect, getProjectById)
    .put(protect, authorizeRoles('admin', 'manager'), updateProject)
    .delete(protect, authorizeRoles('admin', 'manager'), deleteProject);

// Görev oluşturma (belirli bir proje için)
// /api/projects/:projectId/tasks
router.post(
    '/:projectId/tasks',
    protect,
    authorizeRoles('admin', 'manager'),
    createTask
);

// Belirli bir projenin görevlerini getirme
//  /api/projects/:projectId/tasks
router.get(
    '/:projectId/tasks',
    protect,
    getTasksByProjectId
);

module.exports = router;