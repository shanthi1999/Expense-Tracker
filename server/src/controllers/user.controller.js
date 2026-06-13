import userService from '../services/user/user.service.js';
import logger from '../vendors/logger/logger.js';
import authUtils from '../vendors/jwt/auth.js';
import AppError from '../utils/AppError.js';
import envConfig from '../config/env_config.js';
import uploadBufferToCloudinary from '../clients/cloudinary/cloudinary.client.js';
import { isCloudinaryConfigured } from '../vendors/cloudinary/cloudinary.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: envConfig.isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const addUser = async (req, res, next) => {
    const txId = req.id;
    try {
        const { user, accessToken, refreshToken } = await userService.addUser(req.body, txId);
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { user, accessToken },
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const txId = req.id;
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await userService.login(email, password, txId);
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { user, accessToken },
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    const txId = req.id;
    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE];
        if (!token) {
            return apiResponseHelper.customResponseFormat(
                txId,
                res,
                { message: 'Refresh token not found' },
                apiResponseHelper.responseFlags.authenticationFailed
            );
        }
        const { accessToken } = await userService.refreshAccessToken(token, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { accessToken },
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    const txId = req.id;
    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE];
        if (token) {
            try {
                const decoded = authUtils.verifyRefreshToken(token);
                await userService.revokeRefreshToken(decoded.userId, txId);
            } catch (revokeError) {
                logger.warn(`[${txId}] [UserController] [logout] Could not revoke refresh token`, {
                    error: revokeError.message,
                });
            }
        }
        res.clearCookie(REFRESH_TOKEN_COOKIE, {
            httpOnly: true,
            secure: envConfig.isProduction,
            sameSite: 'strict',
        });
        logger.info(`[${txId}] [UserController] [logout] User logged out`);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { message: 'Logged out successfully' },
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    const txId = req.id;
    const userId = req.params.id || req.user.userId;
    try {
        const user = await userService.getUser(userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            user,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    const txId = req.id;
    try {
        const user = await userService.updateUser(req.params.id, req.body, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            user,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const uploadProfileImage = async (req, res, next) => {
    const txId = req.id;

    try {
        if (!isCloudinaryConfigured()) {
            throw new AppError(
                'Cloudinary is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env (API secret is in Cloudinary Dashboard → Settings → API Keys).',
                503
            );
        }

        if (!req.file) {
            throw new AppError('No image file provided', 400);
        }

        const userId = req.user.userId;
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, userId);

        const user = await userService.updateUser(
            userId,
            { profileImage: uploadResult.secure_url },
            txId
        );

        logger.info(`[${txId}] [UserController] [uploadProfileImage] Image uploaded`, {
            userId,
            profileImage: uploadResult.secure_url,
        });

        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { profileImage: uploadResult.secure_url, user },
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    addUser,
    login,
    refreshToken,
    logout,
    getUser,
    updateUser,
    uploadProfileImage,
};
