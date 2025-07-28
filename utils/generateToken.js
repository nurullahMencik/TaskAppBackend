const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token 1 saat sonra geçersiz olacak
    });
};

module.exports = generateToken;