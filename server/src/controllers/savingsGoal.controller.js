import savingsGoalService from '../services/savings/savingsGoal.service.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const addSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    try {
        const goal = await savingsGoalService.addSavingsGoal(req.body, req.user.userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            goal,
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const getSavingsGoals = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await savingsGoalService.getSavingsGoals(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            result,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const updateSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.updateSavingsGoal(id, req.body, req.user.userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            goal,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const contributeToGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.contributeToGoal(
            id,
            req.body.amount,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            goal,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const deleteSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.deleteSavingsGoal(id, req.user.userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            goal,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    addSavingsGoal,
    getSavingsGoals,
    updateSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
};
