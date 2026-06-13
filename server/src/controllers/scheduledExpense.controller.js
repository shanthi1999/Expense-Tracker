import scheduledExpenseService from '../services/expense/scheduledExpense.service.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const addScheduledExpense = async (req, res, next) => {
    const txId = req.id;
    try {
        const record = await scheduledExpenseService.addScheduledExpense(
            req.body,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            record,
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const getScheduledExpenses = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await scheduledExpenseService.getScheduledExpenses(
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

const updateScheduledExpense = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const record = await scheduledExpenseService.updateScheduledExpense(
            id,
            req.body,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            record,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const deleteScheduledExpense = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const record = await scheduledExpenseService.deleteScheduledExpense(
            id,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            record,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const processSchedules = async (req, res, next) => {
    const txId = req.id;
    try {
        await scheduledExpenseService.runScheduledProcessing(txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            { message: 'Scheduled expense processing completed' },
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    addScheduledExpense,
    getScheduledExpenses,
    updateScheduledExpense,
    deleteScheduledExpense,
    processSchedules,
};
