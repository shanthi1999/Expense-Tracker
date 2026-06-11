import jwt from 'jsonwebtoken';
import envConfig from '../../config/env_config.js';
import bcrypt from 'bcrypt';

const createToken = (payload, secret, expiresIn) => {
    try {
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        throw new Error(`Token creation failed: ${error.message}`);
    }
};

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

const createAccessToken = (payload) =>
    createToken(payload, envConfig.jwt.access.secret, envConfig.jwt.access.expiresIn);

const createRefreshToken = (payload) =>
    createToken(payload, envConfig.jwt.refresh.secret, envConfig.jwt.refresh.expiresIn);

const verifyAccessToken = (token) => verifyToken(token, envConfig.jwt.access.secret);

const verifyRefreshToken = (token) => verifyToken(token, envConfig.jwt.refresh.secret);

const hashPassword = (password) => {
    try {
        return bcrypt.hash(password, envConfig.bcrypt.secrets.saltRounds);
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
};

const verifyPassword = (password, hashedPassword) => {
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error(`Password verification failed: ${error.message}`);
    }
};

export default {
    createToken,
    verifyToken,
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashPassword,
    verifyPassword,
};
