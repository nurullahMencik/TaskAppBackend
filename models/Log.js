const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: false // Görev silindiğinde task referansı olmayabilir
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: { // Örnek: 'task_created', 'task_updated', 'task_deleted', 'project_created',.
        type: String,
        required: true
    },
    description: { // Log açıklaması, örneğin "Görev durumu 'pending' -> 'in-progress' olarak değişti"
        type: String,
        required: true
    },
    oldValue: { // Değişiklik öncesi veri 
        type: mongoose.Schema.Types.Mixed // Esnek bir JSON/Object alanı için
    },
    newValue: { // Değişiklik sonrası veri 
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', LogSchema);