const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı zorunludur.'],
        unique: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: [true, 'E-posta zorunludur.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Geçerli bir e-posta adresi girin.']
    },
    password: {
        type: String,
        required: [true, 'Şifre zorunludur.'],
        minlength: 1
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'developer'],
        default: 'developer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Şifre kaydetmeden önce hash'leme
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Şifre karşılaştırma metodu
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);