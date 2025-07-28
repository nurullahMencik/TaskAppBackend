// backend/controllers/projectController.js
const asyncHandler = require('express-async-handler'); // Mutlaka ekleyin
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task'); // Proje silinirken görevleri de silmek için


// POST /api/projects
// Private (Admin, Manager)
const createProject = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const project = await Project.create({
        title,
        description,
        owner: req.user._id, // JWT'den gelen kullanıcı ID'si
    });

    res.status(201).json(project);
});

// @desc    Tüm projeleri getir (yetkiye göre filtreli)
// @route   GET /api/projects
// @access  Private (Tüm yetkili kullanıcılar)
const getProjects = asyncHandler(async (req, res) => {
    let projects;

    if (req.user.role === 'admin') {
        projects = await Project.find({}).populate('owner', 'username email');
    } else if (req.user.role === 'manager') {
        projects = await Project.find({ owner: req.user._id }).populate('owner', 'username email');
    } else { // Developer
        // Developer sadece kendisine atanmış görevlerin ait olduğu projeleri görebilir
        // veya kendi oluşturduğu projeleri.
        projects = await Project.find({ owner: req.user._id }).populate('owner', 'username email');
    }

    res.json(projects);
});

// Belirli bir projeyi getir
// GET /api/projects/:id
// @access  Private 
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate('owner', 'username email');

    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı.');
    }

    //  Admin her projeyi görebilir.
    // Manager ve Developer sadece kendi oluşturduğu veya ilgili olduğu projeleri görmeli.
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
        res.status(403);
        throw new Error('Bu projeyi görüntülemek için yetkiniz yok.');
    }

    res.json(project);
});

// Proje güncelle
// PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı.');
    }

    // Yetkilendirme kontrolü: Admin her projeyi güncelleyebilir. Manager sadece kendi projesini.
    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bu projeyi güncellemek için yetkiniz yok.');
    }

    project.title = title || project.title;
    project.description = description || project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
});

// Proje sil
// DELETE /api/projects/:id
// Private 
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı.');
    }

    // Yetkilendirme kontrolü: Admin her projeyi silebilir. Manager sadece kendi projesini.
    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bu projeyi silmek için yetkiniz yok.');
    }

    // Proje ile ilişkili tüm görevleri sil
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();
    res.json({ message: 'Proje ve ilişkili tüm görevler başarıyla silindi.' });
});

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};