const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

module.exports = {
    generateAccessToken,
    verifyAccessToken
};
