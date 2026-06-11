import userService from '../service/user/user.service.js';
import logger from '../vendors/logger/logger.js';
import authUtils from '../vendors/jwt/auth.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const addUser = async (req, res, next) => {
    const txId = req.id;
    try {
        const { user, accessToken, refreshToken } = await userService.addUser(req.body, txId);
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user, accessToken },
        });
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
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, accessToken },
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    const txId = req.id;
    try {
        const token = req.cookies[REFRESH_TOKEN_COOKIE];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found',
            });
        }
        const { accessToken } = await userService.refreshAccessToken(token, txId);
        res.status(200).json({
            success: true,
            message: 'Access token refreshed successfully',
            data: { accessToken },
        });
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        logger.info(`[${txId}] [UserController] [logout] User logged out`);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    const txId = req.id;
    const userId = req.params.id || req.user.userId;
    try {
        const user = await userService.getUser(userId, txId);
        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    const txId = req.id;
    try {
        const user = await userService.updateUser(req.params.id, req.body, txId);
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
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
};
