const asyncHandler = require('express-async-handler'); 
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Log = require('../models/Log'); 

// Belirli bir projeye yeni görev oluştur
// POST /api/projects/:projectId/tasks
// @access  Private (Admin, Manager)
const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, assignedTo } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı.');
    }

    let assignedUser = null;
    if (assignedTo) {
        assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            res.status(404);
            throw new Error('Atanan kullanıcı bulunamadı.');
        }
    }

    const task = await Task.create({
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        project: projectId,
        assignedTo: assignedUser ? assignedUser._id : null,
        completed: (status === 'completed') // Başlangıçta completed durumunu da ayarla
    });

    // LOG KAYDI: Görev oluşturma
    await Log.create({
        task: task._id,
        user: req.user._id, // Görevi oluşturan kullanıcı
        action: 'task_created',
        description: `"${task.title}" başlıklı yeni görev oluşturuldu.`,
        newValue: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo ? (await User.findById(task.assignedTo)).username : 'Yok',
            project: task.project ? (await Project.findById(task.project)).title : 'Yok'
        }
    });

    res.status(201).json(task);
});

// Belirli bir projenin tüm görevlerini getir
// GET /api/projects/:projectId/tasks
// Private (Yetkili kullanıcılar)
const getTasksByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı.');
    }

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
        const tasks = await Task.find({ project: projectId, assignedTo: req.user._id })
            .populate('assignedTo', 'username email')
            .populate('project', 'title');
        return res.json(tasks);
    }

    const tasks = await Task.find({ project: projectId })
        .populate('assignedTo', 'username email')
        .populate('project', 'title');
    res.json(tasks);
});

// Belirli bir görevi getir
// GET /api/tasks/:id
// Private (Yetkili kullanıcılar)
const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('project', 'title owner') // project'ten title ve owner'ı populate ettik
        .populate('assignedTo', 'username email');

    if (!task) {
        res.status(404);
        throw new Error('Görev bulunamadı.');
    }

    const isOwner = task.project.owner.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isOwner || isAssigned) {
        res.json(task);
    } else {
        res.status(403);
        throw new Error('Bu görevi görüntülemek için yetkiniz yok.');
    }
});

// Görevi güncelle
// PUT /api/tasks/:id
// Private (Admin, Manager, Developer - atanmış ise)
const updateTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, assignedTo } = req.body;

    const task = await Task.findById(req.params.id)
        .populate('project', 'owner title') // Project'in title'ını da al
        .populate('assignedTo', 'username');

    if (!task) {
        res.status(404);
        throw new Error('Görev bulunamadı.');
    }

    const isOwnerOfProject = task.project.owner.toString() === req.user._id.toString();
    const isAssignedToTask = task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString();

    // Yetkilendirme kontrolü
    if (req.user.role === 'admin' || isOwnerOfProject || (req.user.role === 'developer' && isAssignedToTask)) {
        const oldTask = { ...task._doc }; // Eski task verisini kopyala

        // Değişiklikleri izlemek için boş bir dizi
        const changes = [];

        // Başlık değişti mi?
        if (title !== undefined && oldTask.title !== title) {
            changes.push(`Başlık: '${oldTask.title}' -> '${title}'`);
            task.title = title;
        }
        // Açıklama değişti mi?
        if (description !== undefined && oldTask.description !== description) {
            changes.push(`Açıklama güncellendi.`); 
            task.description = description;
        }

        // Durum değişti mi?
        if (status !== undefined && oldTask.status !== status) {
            changes.push(`Durum: '${oldTask.status}' -> '${status}'`);
            task.status = status;
            task.completed = (status === 'completed'); // 'completed' flag'ini de güncelle
        }

        // Öncelik değişti mi?
        if (priority !== undefined && oldTask.priority !== priority) {
            changes.push(`Öncelik: '${oldTask.priority}' -> '${priority}'`);
            task.priority = priority;
        }

        // Atanan kişi değişti mi?
        if (assignedTo !== undefined) {
            if (req.user.role === 'admin' || req.user.role === 'manager') {
                let newAssignedUser = null;
                if (assignedTo) {
                    newAssignedUser = await User.findById(assignedTo);
                    if (!newAssignedUser) {
                        res.status(404);
                        throw new Error('Atanacak kullanıcı bulunamadı.');
                    }
                }

                const oldAssignedId = oldTask.assignedTo ? oldTask.assignedTo.toString() : null;
                const newAssignedId = newAssignedUser ? newAssignedUser._id.toString() : null;

                if (oldAssignedId !== newAssignedId) {
                    const oldAssignedName = oldTask.assignedTo ? oldTask.assignedTo.username : 'Atanmadı';
                    const newAssignedName = newAssignedUser ? newAssignedUser.username : 'Atanmadı';
                    changes.push(`Atanan kişi: '${oldAssignedName}' -> '${newAssignedName}'`);
                    task.assignedTo = newAssignedUser ? newAssignedUser._id : null;
                }
            } else {
                // Atanan kişi sadece admin veya manager tarafından değiştirilebilir.
                // Eğer developer sadece kendi görevini güncelliyorsa assignedTo göndermemeli
                if (assignedTo !== (task.assignedTo ? task.assignedTo._id.toString() : null) && assignedTo !== '') {
                    res.status(403);
                    throw new Error('Görev atamasını değiştirmek için yetkiniz yok.');
                }
            }
        }
        
        // Sadece gerçekten bir değişiklik varsa kaydet ve logla
        if (changes.length > 0) {
            const updatedTask = await task.save();

            // LOG KAYDI: Görev güncelleme
            await Log.create({
                task: updatedTask._id,
                user: req.user._id, // Güncelleme yapan kullanıcı
                action: 'task_updated',
                description: `Görev güncellendi: ${changes.join(', ')}`,
                oldValue: {
                    title: oldTask.title,
                    description: oldTask.description,
                    status: oldTask.status,
                    priority: oldTask.priority,
                    assignedTo: oldTask.assignedTo ? oldTask.assignedTo.username : 'Yok',
                },
                newValue: {
                    title: updatedTask.title,
                    description: updatedTask.description,
                    status: updatedTask.status,
                    priority: updatedTask.priority,
                    assignedTo: updatedTask.assignedTo ? (await User.findById(updatedTask.assignedTo)).username : 'Yok',
                }
            });

            res.json(updatedTask);
        } else {
            res.status(200).json({ message: 'Hiçbir değişiklik yapılmadı.', task });
        }

    } else {
        res.status(403);
        throw new Error('Bu görevi güncellemek için yetkiniz yok.');
    }
});

// Görevi sil
// DELETE /api/tasks/:id
// Private (Admin, Manager - kendi projesindeki)
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id).populate('project', 'owner');

    if (!task) {
        res.status(404);
        throw new Error('Görev bulunamadı.');
    }

    const isOwnerOfProject = task.project.owner.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || (req.user.role === 'manager' && isOwnerOfProject)) {
        const deletedTaskTitle = task.title; // Log için başlığı al
        const deletedTaskId = task._id; // Log için ID'yi al
        await task.deleteOne();

        // LOG KAYDI: Görev silme
        await Log.create({
            task: deletedTaskId, // Silinen görevin ID'si
            user: req.user._id, // Silme yapan kullanıcı
            action: 'task_deleted',
            description: `"${deletedTaskTitle}" başlıklı görev silindi.`,
            oldValue: { // Silinen görevin bazı bilgileri
                title: deletedTaskTitle,
                description: task.description,
                status: task.status,
                priority: task.priority,
                assignedTo: task.assignedTo ? (await User.findById(task.assignedTo)).username : 'Yok',
                project: task.project ? (await Project.findById(task.project)).title : 'Yok'
            }
        });

        res.json({ message: 'Görev başarıyla silindi.' });
    } else {
        res.status(403);
        throw new Error('Bu görevi silmek için yetkiniz yok.');
    }
});

// Bir görevin log geçmişini getir (Bonus)
// GET /api/tasks/:id/logs
// Private (Yetkili kullanıcılar)
const getTaskLogs = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id).populate('project', 'owner');
    if (!task) {
        res.status(404);
        throw new Error('Görev bulunamadı.');
    }

    const isOwnerOfProject = task.project.owner.toString() === req.user._id.toString();
    const isAssignedToTask = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isOwnerOfProject || isAssignedToTask) {
        const logs = await Log.find({ task: req.params.id }).sort({ timestamp: -1 }).populate('user', 'username');
        res.json(logs);
    } else {
        res.status(403);
        throw new Error('Bu görevin loglarını görüntülemek için yetkiniz yok.');
    }
});


module.exports = {
    createTask,
    getTasksByProjectId,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskLogs
};