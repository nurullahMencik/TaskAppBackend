const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Proje başlığı zorunludur.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Proje açıklaması zorunludur.']
    },
    owner: { // Projeyi oluşturan kullanıcı
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);