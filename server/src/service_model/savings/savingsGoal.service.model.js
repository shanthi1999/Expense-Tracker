import savingsGoalModel from '../../models/savings/savingsGoal.model.js';
import logger from '../../vendors/logger/logger.js';

class savingsGoalDbModelApi {
    async getSavingsGoals(filter, limit, skip, sortOption, txId) {
        logger.info(`[${txId}] [SavingsGoalServiceModel] [getSavingsGoals] Querying`, {
            filter,
            limit,
            skip,
        });
        try {
            const data = await savingsGoalModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const total = await savingsGoalModel.countDocuments(filter);
            return { data, total };
        } catch (error) {
            logger.error(`[${txId}] [SavingsGoalServiceModel] [getSavingsGoals] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async getSavingsGoal(filter, txId) {
        logger.info(`[${txId}] [SavingsGoalServiceModel] [getSavingsGoal] Fetching`, { filter });
        try {
            return await savingsGoalModel.findOne(filter);
        } catch (error) {
            logger.error(`[${txId}] [SavingsGoalServiceModel] [getSavingsGoal] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async createSavingsGoal(document, txId) {
        logger.info(`[${txId}] [SavingsGoalServiceModel] [createSavingsGoal] Creating`, {
            document,
        });
        try {
            const record = new savingsGoalModel(document);
            return await record.save();
        } catch (error) {
            logger.error(`[${txId}] [SavingsGoalServiceModel] [createSavingsGoal] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async updateSavingsGoal(filter, document, txId) {
        logger.info(`[${txId}] [SavingsGoalServiceModel] [updateSavingsGoal] Updating`, {
            filter,
            document,
        });
        try {
            return await savingsGoalModel.findOneAndUpdate(filter, document, { new: true });
        } catch (error) {
            logger.error(`[${txId}] [SavingsGoalServiceModel] [updateSavingsGoal] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async deleteSavingsGoal(filter, txId) {
        logger.info(`[${txId}] [SavingsGoalServiceModel] [deleteSavingsGoal] Deleting`, { filter });
        try {
            return await savingsGoalModel.findOneAndDelete(filter);
        } catch (error) {
            logger.error(`[${txId}] [SavingsGoalServiceModel] [deleteSavingsGoal] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }
}

export default savingsGoalDbModelApi;
