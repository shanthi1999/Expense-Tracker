import expenseService from '../services/expense/expense.service.js';
import logger from '../vendors/logger/logger.js';
import AppError from '../utils/AppError.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const addExpense = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [addExpense] Request received`, { body: req.body });
    try {
        const expense = await expenseService.addExpense(req.body, req.user.userId, txId);
        logger.info(`[${txId}] [ExpenseController] [addExpense] Expense created successfully`, {
            expenseId: expense.expenseId,
        });
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            expense,
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const getExpense = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [getExpense] Request received`, {
        query: req.query,
    });
    try {
        const expenses = await expenseService.getExpenses(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        logger.info(`[${txId}] [ExpenseController] [getExpense] Expenses fetched successfully`, {
            total: expenses.total,
        });
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenses,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const updateExpense = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    logger.info(`[${txId}] [ExpenseController] [updateExpense] Request received`, {
        expenseId: id,
        body: req.body,
    });
    try {
        const expense = await expenseService.updateExpense(id, req.body, req.user.userId, txId);
        logger.info(`[${txId}] [ExpenseController] [updateExpense] Expense updated successfully`, {
            expenseId: id,
        });
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            expense,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    logger.info(`[${txId}] [ExpenseController] [deleteExpense] Request received`, {
        expenseId: id,
    });
    try {
        const expense = await expenseService.deleteExpense(id, req.user.userId, txId);
        logger.info(`[${txId}] [ExpenseController] [deleteExpense] Expense deleted successfully`, {
            expenseId: id,
        });
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            expense,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const getAiSummary = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [getAiSummary] Request received`, {
        query: req.query,
    });
    try {
        const summary = await expenseService.getAiSummary(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        logger.info(`[${txId}] [ExpenseController] [getAiSummary] Summary generated successfully`);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            summary,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const exportExpenseReport = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [exportExpenseReport] Request received`, {
        query: req.query,
    });
    try {
        const file = await expenseService.exportExpenses(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        logger.info(`[${txId}] [ExpenseController] [exportExpenseReport] Export generated`, {
            filename: file.filename,
        });
        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        return res.status(200).send(file.buffer);
    } catch (error) {
        next(error);
    }
};

const scanReceipt = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [scanReceipt] Request received`);

    try {
        if (!req.file?.buffer) {
            throw new AppError('Receipt image is required', 400);
        }

        const result = await expenseService.scanReceipt(req.file.buffer, req.user.userId, txId);

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

const parseVoiceExpense = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [parseVoiceExpense] Request received`);

    try {
        const result = await expenseService.parseVoiceExpense(
            req.body.transcript,
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

export default {
    addExpense,
    getExpense,
    updateExpense,
    deleteExpense,
    getAiSummary,
    exportExpenseReport,
    scanReceipt,
    parseVoiceExpense,
};
