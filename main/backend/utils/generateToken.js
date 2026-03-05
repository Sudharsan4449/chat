const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3650d', // Long lived token for permanent login (10 years)
    });
};

module.exports = generateToken;
