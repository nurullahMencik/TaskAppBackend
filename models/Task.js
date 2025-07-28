// backend/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Görev başlığı zorunludur.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Görev açıklaması zorunludur.']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'], 
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    project: { // Görevin ait olduğu proje
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo: { // Görevin atandığı kullanıcı
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Başlangıçta kimseye atanmamış olabilir
    },
    // status 'completed' olduğunda true yapabiliriz.

    completed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// Güncelleme öncesi updatedAt alanını otomatik güncelle
TaskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', TaskSchema);