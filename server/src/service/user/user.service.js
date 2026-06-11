import userDbModelApi from '../../service_model/user/user.service.model.js';
import logger from '../../vendors/logger/logger.js';
import authUtils from '../../vendors/jwt/auth.js';
import commonEnums from '../../enums/common.enums.js';
import AppError from '../../utils/AppError.js';

const { hashPassword, createAccessToken, createRefreshToken, verifyRefreshToken, verifyPassword } =
    authUtils;

const ALLOWED_UPDATE_FIELDS = [
    'firstName',
    'lastName',
    'dob',
    'gender',
    'monthlyIncome',
    'budget',
    'currency',
    'profileImage',
];

const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        throw new AppError('Password and confirm password do not match', 400);
    }
};

const sanitizeUser = (user) => {
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
};

const addUser = async (userDocument, txId) => {
    logger.info(`[${txId}] [UserService] [addUser] Adding user`, { email: userDocument.email });
    try {
        validatePasswordMatch(userDocument.password, userDocument.confirmPassword);
        const userDbApi = new userDbModelApi();

        const existingUser = await userDbApi.getUserByEmail(userDocument.email, txId);
        if (existingUser) {
            throw new AppError(`User already exists with email: ${userDocument.email}`, 409);
        }

        const hashedPassword = await hashPassword(userDocument.password);
        const newUserDoc = { ...userDocument, password: hashedPassword };
        delete newUserDoc.confirmPassword;

        const user = await userDbApi.createUser(newUserDoc, txId);
        if (!user) {
            throw new AppError('User creation failed', 500);
        }

        const tokenPayload = {
            userId: user.userId,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
        };
        const accessToken = createAccessToken(tokenPayload);
        const refreshToken = createRefreshToken({ userId: user.userId });
        await userDbApi.updateUser(user.userId, { refreshToken }, txId);

        logger.info(`[${txId}] [UserService] [addUser] User added successfully`, {
            userId: user.userId,
        });
        return { user: sanitizeUser(user), accessToken, refreshToken };
    } catch (error) {
        logger.error(`[${txId}] [UserService] [addUser] Failed`, { error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500);
    }
};

const login = async (email, password, txId) => {
    logger.info(`[${txId}] [UserService] [login] Login attempt`, { email });
    try {
        const userDbApi = new userDbModelApi();
        const user = await userDbApi.getUserByEmail(email, txId);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const tokenPayload = {
            userId: user.userId,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
        };
        const accessToken = createAccessToken(tokenPayload);
        const refreshToken = createRefreshToken({ userId: user.userId });
        await userDbApi.updateUser(user.userId, { refreshToken }, txId);

        logger.info(`[${txId}] [UserService] [login] Login successful`, { userId: user.userId });
        return { user: sanitizeUser(user), accessToken, refreshToken };
    } catch (error) {
        logger.error(`[${txId}] [UserService] [login] Failed`, { error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500);
    }
};

const getUser = async (userId, txId) => {
    logger.info(`[${txId}] [UserService] [getUser] Fetching user`, { userId });
    try {
        const userDbApi = new userDbModelApi();
        const user = await userDbApi.getUser(userId, txId);
        if (!user) {
            throw new AppError(`No user found for id: ${userId}`, 404);
        }
        logger.info(`[${txId}] [UserService] [getUser] User fetched successfully`, { userId });
        return user;
    } catch (error) {
        logger.error(`[${txId}] [UserService] [getUser] Failed`, { userId, error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500);
    }
};

const getUsers = async (userQuery, txId) => {
    logger.info(`[${txId}] [UserService] [getUsers] Fetching users`, { query: userQuery });
    try {
        const { page = 1, limit = 10, firstName, email, sortBy, order } = userQuery;

        const userDbApi = new userDbModelApi();
        let filter = {};
        let sortOption = {};

        if (firstName) {
            filter.firstName = { $regex: firstName, $options: 'i' };
        }
        if (email) {
            filter.email = { $regex: email, $options: 'i' };
        }
        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        }

        const skip = (Number(page) - 1) * Number(limit);
        logger.info(`[${txId}] [UserService] [getUsers] Querying DB`, {
            filter,
            skip,
            limit,
            sortOption,
        });

        const result = await userDbApi.getUsers(filter, Number(limit), skip, sortOption, txId);
        logger.info(`[${txId}] [UserService] [getUsers] Users fetched`, { total: result.total });
        return {
            ...result,
            limit: Number(limit),
            page: Number(page),
        };
    } catch (error) {
        logger.error(`[${txId}] [UserService] [getUsers] Failed`, { error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching users: ${error.message}`, 500);
    }
};

const updateUser = async (userId, updateData, txId) => {
    logger.info(`[${txId}] [UserService] [updateUser] Updating user`, { userId });
    try {
        const userDbApi = new userDbModelApi();

        const existingUser = await userDbApi.getUser(userId, txId);
        if (!existingUser) {
            throw new AppError(`No user found for id: ${userId}`, 404);
        }

        const filteredUpdate = Object.fromEntries(
            Object.entries(updateData).filter(([key]) => ALLOWED_UPDATE_FIELDS.includes(key))
        );

        const updatedUser = await userDbApi.updateUser(userId, filteredUpdate, txId);
        logger.info(`[${txId}] [UserService] [updateUser] User updated successfully`, { userId });
        return updatedUser;
    } catch (error) {
        logger.error(`[${txId}] [UserService] [updateUser] Failed`, {
            userId,
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500);
    }
};

const revokeRefreshToken = async (userId, txId) => {
    logger.info(`[${txId}] [UserService] [revokeRefreshToken] Revoking refresh token`, { userId });
    try {
        const userDbApi = new userDbModelApi();
        await userDbApi.updateUser(userId, { refreshToken: null }, txId);
        logger.info(`[${txId}] [UserService] [revokeRefreshToken] Refresh token revoked`, {
            userId,
        });
    } catch (error) {
        logger.error(`[${txId}] [UserService] [revokeRefreshToken] Failed`, {
            userId,
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500);
    }
};

const refreshAccessToken = async (refreshToken, txId) => {
    logger.info(`[${txId}] [UserService] [refreshAccessToken] Refreshing access token`);
    try {
        const decoded = verifyRefreshToken(refreshToken);
        const userDbApi = new userDbModelApi();
        const user = await userDbApi.getUserWithRefreshToken(decoded.userId, txId);
        if (!user) {
            throw new AppError('User not found', 401);
        }
        if (!user.refreshToken || user.refreshToken !== refreshToken) {
            throw new AppError('Invalid or expired refresh token', 401);
        }
        if (!user.isActive) {
            throw new AppError('User account is inactive', 403);
        }
        const accessToken = createAccessToken({
            userId: user.userId,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
        });
        logger.info(`[${txId}] [UserService] [refreshAccessToken] Access token refreshed`, {
            userId: user.userId,
        });
        return { accessToken };
    } catch (error) {
        logger.error(`[${txId}] [UserService] [refreshAccessToken] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

export default {
    addUser,
    login,
    getUser,
    getUsers,
    updateUser,
    refreshAccessToken,
    revokeRefreshToken,
};
