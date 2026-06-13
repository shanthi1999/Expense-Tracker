import savingsGoalDbModelApi from '../../service_model/savings/savingsGoal.service.model.js';
import savingsGoalUtils from '../../utils/savingsGoal.utils.js';
import logger from '../../vendors/logger/logger.js';
import commonEnums from '../../enums/common.enums.js';
import AppError from '../../utils/AppError.js';

const validateSavingsGoal = async (savingsGoalId, userId, txId) => {
    const db = new savingsGoalDbModelApi();
    const goal = await db.getSavingsGoal({ savingsGoalId, userId }, txId);

    if (!goal) {
        throw new AppError(`No savings goal found for ${savingsGoalId}`, 404);
    }

    return goal;
};

const enrich = (goal) => savingsGoalUtils.enrichSavingsGoal(goal);

const getSavingsGoals = async (query, userId, txId) => {
    logger.info(`[${txId}] [SavingsGoalService] [getSavingsGoals] Fetching`, { query, userId });

    try {
        const { page = 1, limit = 10, sortBy, order, activeOnly } = query;
        const filter = { userId };

        const sortOption = {};
        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        } else {
            sortOption.deadline = 1;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const db = new savingsGoalDbModelApi();
        const result = await db.getSavingsGoals(filter, Number(limit), skip, sortOption, txId);

        const data = result.data.map(enrich).filter((g) => (activeOnly ? !g.isComplete : true));

        return {
            data,
            total: activeOnly ? data.length : result.total,
            page: Number(page),
            limit: Number(limit),
        };
    } catch (error) {
        logger.error(`[${txId}] [SavingsGoalService] [getSavingsGoals] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to fetch savings goals: ${error.message}`, 500);
    }
};

const addSavingsGoal = async (payload, userId, txId) => {
    logger.info(`[${txId}] [SavingsGoalService] [addSavingsGoal] Creating`, { payload, userId });

    try {
        if (new Date(payload.deadline) <= new Date()) {
            throw new AppError('Deadline must be in the future', 400);
        }

        const db = new savingsGoalDbModelApi();
        const goal = await db.createSavingsGoal({ ...payload, userId }, txId);
        return enrich(goal);
    } catch (error) {
        logger.error(`[${txId}] [SavingsGoalService] [addSavingsGoal] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to create savings goal: ${error.message}`, 500);
    }
};

const updateSavingsGoal = async (savingsGoalId, payload, userId, txId) => {
    logger.info(`[${txId}] [SavingsGoalService] [updateSavingsGoal] Updating`, {
        savingsGoalId,
        userId,
    });

    try {
        const db = new savingsGoalDbModelApi();
        const existing = await validateSavingsGoal(savingsGoalId, userId, txId);

        if (payload.deadline && new Date(payload.deadline) <= new Date()) {
            throw new AppError('Deadline must be in the future', 400);
        }

        if (payload.savedAmount != null && payload.savedAmount > existing.targetAmount) {
            throw new AppError('Saved amount cannot exceed target amount', 400);
        }

        const updated = await db.updateSavingsGoal({ savingsGoalId, userId }, payload, txId);
        return enrich(updated);
    } catch (error) {
        logger.error(`[${txId}] [SavingsGoalService] [updateSavingsGoal] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to update savings goal: ${error.message}`, 500);
    }
};

const contributeToGoal = async (savingsGoalId, amount, userId, txId) => {
    logger.info(`[${txId}] [SavingsGoalService] [contributeToGoal] Contributing`, {
        savingsGoalId,
        amount,
        userId,
    });

    try {
        const existing = await validateSavingsGoal(savingsGoalId, userId, txId);
        const newSaved = Math.min(existing.targetAmount, (existing.savedAmount || 0) + amount);
        const db = new savingsGoalDbModelApi();
        const updated = await db.updateSavingsGoal(
            { savingsGoalId, userId },
            { savedAmount: newSaved },
            txId
        );
        return enrich(updated);
    } catch (error) {
        logger.error(`[${txId}] [SavingsGoalService] [contributeToGoal] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to add savings: ${error.message}`, 500);
    }
};

const deleteSavingsGoal = async (savingsGoalId, userId, txId) => {
    logger.info(`[${txId}] [SavingsGoalService] [deleteSavingsGoal] Deleting`, {
        savingsGoalId,
        userId,
    });

    try {
        await validateSavingsGoal(savingsGoalId, userId, txId);
        const db = new savingsGoalDbModelApi();
        const deleted = await db.deleteSavingsGoal({ savingsGoalId, userId }, txId);
        return enrich(deleted);
    } catch (error) {
        logger.error(`[${txId}] [SavingsGoalService] [deleteSavingsGoal] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to delete savings goal: ${error.message}`, 500);
    }
};

export default {
    getSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
};
