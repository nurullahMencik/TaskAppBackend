const asyncHandler = require('express-async-handler'); 
const User = require('../models/User'); 

// Tüm kullanıcıları getir
// GET /api/users
const getAllUsers = asyncHandler(async (req, res) => {
    // req.user ile token'dan gelen kullanıcı bilgisine erişilebilir (protect middleware'ı sayesinde)

    const users = await User.find().select('-password'); // Şifre alanı hariç tüm kullanıcıları getir
    res.status(200).json(users);
});

module.exports = {
    getAllUsers, 
};