import expenseService from '../service/expense/expense.service.js';
import logger from '../vendors/logger/logger.js';

const addExpense = async (req, res, next) => {
    const txId = req.id;
    logger.info(`[${txId}] [ExpenseController] [addExpense] Request received`, { body: req.body });
    try {
        const expense = await expenseService.addExpense(req.body, req.user.userId, txId);
        logger.info(`[${txId}] [ExpenseController] [addExpense] Expense created successfully`, {
            expenseId: expense.expenseId,
        });
        return res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Expenses fetched successfully',
            ...expenses,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense,
        });
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
        return res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
            data: expense,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    addExpense,
    getExpense,
    updateExpense,
    deleteExpense,
};
