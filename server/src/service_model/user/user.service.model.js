import userSchemaModel from '../../models/users/user.model.js';
import logger from '../../vendors/logger/logger.js';

class userDbModelApi {
    async getUser(userId, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [getUser] Fetching user`, { userId });
        try {
            const user = await userSchemaModel.findOne({ userId }).lean();
            logger.info(`[${txId}] [UserDbModelApi] [getUser] Query successful`, { userId });
            return user;
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [getUser] Failed`, {
                userId,
                error: error.message,
            });
            throw new Error(error.message);
        }
    }

    async getUserWithRefreshToken(userId, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [getUserWithRefreshToken] Fetching user`, {
            userId,
        });
        try {
            const user = await userSchemaModel.findOne({ userId }).select('+refreshToken').lean();
            logger.info(`[${txId}] [UserDbModelApi] [getUserWithRefreshToken] Query successful`, {
                userId,
            });
            return user;
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [getUserWithRefreshToken] Failed`, {
                userId,
                error: error.message,
            });
            throw new Error(error.message);
        }
    }

    async getUserByEmail(email, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [getUserByEmail] Fetching user by email`, {
            email,
        });
        try {
            const user = await userSchemaModel.findOne({ email }).select('+password').lean();
            logger.info(`[${txId}] [UserDbModelApi] [getUserByEmail] Query successful`, { email });
            return user;
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [getUserByEmail] Failed`, {
                email,
                error: error.message,
            });
            throw new Error(error.message);
        }
    }

    async getUsers(filter, limit, skip, sortOption, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [getUsers] Fetching users`, {
            filter,
            limit,
            skip,
            sortOption,
        });
        try {
            const users = await userSchemaModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const total = await userSchemaModel.countDocuments(filter);
            logger.info(`[${txId}] [UserDbModelApi] [getUsers] Query successful`, { total });
            return { data: users, total };
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [getUsers] Failed`, {
                filter,
                error: error.message,
            });
            throw new Error(error.message);
        }
    }

    async createUser(userDocument, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [createUser] Creating user`, {
            email: userDocument.email,
        });
        try {
            const user = await userSchemaModel.create(userDocument);
            logger.info(`[${txId}] [UserDbModelApi] [createUser] User created successfully`, {
                userId: user.userId,
            });
            return user.toObject();
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [createUser] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }

    async updateUser(userId, userDocument, txId) {
        logger.info(`[${txId}] [UserDbModelApi] [updateUser] Updating user`, { userId });
        try {
            const user = await userSchemaModel
                .findOneAndUpdate({ userId }, { $set: userDocument }, { new: true })
                .lean();
            logger.info(`[${txId}] [UserDbModelApi] [updateUser] User updated successfully`, {
                userId,
            });
            return user;
        } catch (error) {
            logger.error(`[${txId}] [UserDbModelApi] [updateUser] Failed`, {
                userId,
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
}

export default userDbModelApi;
