import scheduledExpenseService from '../service/expense/scheduledExpense.service.js';
import logger from '../vendors/logger/logger.js';

const addScheduledExpense = async (req, res, next) => {
    const txId = req.id;
    try {
        const record = await scheduledExpenseService.addScheduledExpense(
            req.body,
            req.user.userId,
            txId
        );
        return res.status(201).json({
            success: true,
            message: 'Scheduled expense created successfully',
            data: record,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Scheduled expenses fetched successfully',
            ...result,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Scheduled expense updated successfully',
            data: record,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Scheduled expense deleted successfully',
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

const processSchedules = async (req, res, next) => {
    const txId = req.id;
    try {
        await scheduledExpenseService.runScheduledProcessing(txId);
        return res.status(200).json({
            success: true,
            message: 'Scheduled expense processing completed',
        });
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
