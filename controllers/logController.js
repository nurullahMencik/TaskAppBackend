// backend/controllers/logController.js
const asyncHandler = require('express-async-handler');
const Log = require('../models/Log');
const Task = require('../models/Task'); // Task modelini import ettiğinizden emin olun!


//GET /api/logs
// Private/Admin (Sadece adminler tüm logları görebilir)
const getAllLogs = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403); // Forbidden (Yasak)
        throw new Error('Tüm logları görüntülemek için yetkiniz yok.');
    }

    const logs = await Log.find({})
        .populate('user', 'username email role')
        .populate('task', 'title description');
    res.status(200).json(logs);
});

// Belirli bir göreve ait logları getir
// GET /api/logs/task/:taskId
const getLogsByTaskId = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate('project', 'owner'); // Project'in owner'ını populate et
    
    if (!task) {
        res.status(404);
        throw new Error('Görev bulunamadı.');
    }

    // Yetkilendirme kontrolü 
    const isOwner = task.project.owner.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isOwner || isAssigned) {
        const logs = await Log.find({ task: taskId })
            .populate('user', 'username email')
            .sort({ timestamp: -1 });
        res.status(200).json(logs);
    } else {
        res.status(403);
        throw new Error('Bu göreve ait logları görüntülemek için yetkiniz yok.');
    }
});

module.exports = {
    getAllLogs,
    getLogsByTaskId
};