import expenseDbModelApi from '../../service_model/expense/expense.service.model.js';
import categoryDbModelApi from '../../service_model/expense/category.service.model.js';
import expenseTypeDbModelApi from '../../service_model/expense/expenseType.service.model.js';
import categoryService from './category.service.js';
import expenseTypeService from './expenseType.service.js';
import aiService from '../../services/ai.service.js';
import userService from '../user/user.service.js';
import expenseReportExport from '../../utils/expenseReportExport.js';
import logger from '../../vendors/logger/logger.js';
import commonEnums from '../../enums/common.enums.js';
import AppError from '../../utils/AppError.js';

const validateExpense = async (expenseId, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [validateExpense] Validating expense`, {
        expenseId,
        userId,
    });

    const expenseDBModelApi = new expenseDbModelApi();
    const expense = await expenseDBModelApi.getExpense({ expenseId, userId }, txId);

    if (!expense) {
        logger.warn(`[${txId}] [ExpenseService] [validateExpense] Expense not found`, {
            expenseId,
            userId,
        });
        throw new AppError(`No Expense found for ${expenseId}`, 404);
    }

    logger.info(`[${txId}] [ExpenseService] [validateExpense] Expense validated`, { expenseId });
    return expense;
};

const validateForeignKeys = async (categoryId, expenseTypeId, userId, txId) => {
    await categoryService.getCategory(categoryId, userId, txId);
    await expenseTypeService.getExpenseType(expenseTypeId, userId, txId);
};

const getExpenses = async (expenseQuery, userId, txId, additionalFilter = {}) => {
    logger.info(`[${txId}] [ExpenseService] [getExpenses] Fetching expenses`, {
        query: expenseQuery,
        userId,
    });

    try {
        const {
            page = 1,
            limit = 10,
            categoryId,
            expenseTypeId,
            sortBy,
            order,
            dateFrom,
            dateTo,
        } = expenseQuery;

        const expenseDBModelApi = new expenseDbModelApi();
        let filter = { userId, ...additionalFilter };
        let sortOption = {};

        if (categoryId) {
            filter.categoryId = categoryId;
        }
        if (expenseTypeId) {
            filter.expenseTypeId = expenseTypeId;
        }
        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) filter.date.$gte = new Date(dateFrom);
            if (dateTo) filter.date.$lte = new Date(dateTo);
        }
        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        }

        const skip = (Number(page) - 1) * Number(limit);
        logger.info(`[${txId}] [ExpenseService] [getExpenses] Querying DB`, {
            filter,
            skip,
            limit,
            sortOption,
        });

        const expenseList = await expenseDBModelApi.getExpenses(
            filter,
            Number(limit),
            skip,
            sortOption,
            txId
        );

        logger.info(`[${txId}] [ExpenseService] [getExpenses] Expenses fetched`, {
            total: expenseList.total,
        });

        return {
            ...expenseList,
            limit: Number(limit),
            page: Number(page),
        };
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [getExpenses] Failed`, { error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(`Error in fetching the expenseList: ${error.message}`, 500);
    }
};

const addExpense = async (expense, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [addExpense] Adding expense`, { expense, userId });

    try {
        await validateForeignKeys(expense.categoryId, expense.expenseTypeId, userId, txId);

        const expenseDBModelApi = new expenseDbModelApi();
        const expenseDocument = { ...expense, userId };
        const newExpense = await expenseDBModelApi.createExpense(expenseDocument, txId);

        logger.info(`[${txId}] [ExpenseService] [addExpense] Expense added`, {
            expenseId: newExpense.expenseId,
        });

        return newExpense;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [addExpense] Failed`, { error: error.message });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to add expense: ${error.message}`, 500);
    }
};

const updateExpense = async (expenseId, expense, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [updateExpense] Updating expense`, {
        expenseId,
        userId,
    });

    try {
        const expenseDBModelApi = new expenseDbModelApi();
        await validateExpense(expenseId, userId, txId);

        if (expense.categoryId || expense.expenseTypeId) {
            const existing = await expenseDBModelApi.getExpense({ expenseId, userId }, txId);
            const categoryIdToValidate = expense.categoryId || existing.categoryId;
            const expenseTypeIdToValidate = expense.expenseTypeId || existing.expenseTypeId;
            await validateForeignKeys(categoryIdToValidate, expenseTypeIdToValidate, userId, txId);
        }

        const updatedExpense = await expenseDBModelApi.updateExpense(
            { expenseId, userId },
            expense,
            txId
        );

        logger.info(`[${txId}] [ExpenseService] [updateExpense] Expense updated`, { expenseId });
        return updatedExpense;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [updateExpense] Failed`, {
            expenseId,
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to update expense: ${error.message}`, 500);
    }
};

const deleteExpense = async (expenseId, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [deleteExpense] Deleting expense`, {
        expenseId,
        userId,
    });

    try {
        const expenseDBModelApi = new expenseDbModelApi();
        await validateExpense(expenseId, userId, txId);
        const deletedExpense = await expenseDBModelApi.deleteExpense({ expenseId, userId }, txId);

        logger.info(`[${txId}] [ExpenseService] [deleteExpense] Expense deleted`, { expenseId });
        return deletedExpense;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [deleteExpense] Failed`, {
            expenseId,
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to delete expense: ${error.message}`, 500);
    }
};

const getExpense = async (expenseId, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [getExpense] Fetching single expense`, {
        expenseId,
        userId,
    });

    try {
        return await validateExpense(expenseId, userId, txId);
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [getExpense] Failed`, {
            expenseId,
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching expense: ${error.message}`, 500);
    }
};

const getEnrichedExpenseRows = async (expenseQuery, userId, txId) => {
    const user = await userService.getUser(userId, txId);
    const currency = user?.currency || 'USD';

    const expenseList = await getExpenses(
        {
            ...expenseQuery,
            page: 1,
            limit: 5000,
            sortBy: expenseQuery.sortBy || 'date',
            order: expenseQuery.order || 'DESC',
        },
        userId,
        txId
    );

    const categoryDBModelApi = new categoryDbModelApi();
    const expenseTypeDBModelApi = new expenseTypeDbModelApi();

    const [categoriesResult, expenseTypesResult] = await Promise.all([
        categoryDBModelApi.getCategories({ userId }, 500, 0, {}, txId),
        expenseTypeDBModelApi.getExpenseTypes({ userId }, 500, 0, {}, txId),
    ]);

    const categoryMap = Object.fromEntries(
        (categoriesResult.data || []).map((c) => [c.categoryId, c.title])
    );
    const typeMap = Object.fromEntries(
        (expenseTypesResult.data || []).map((t) => [t.expenseTypeId, t.title])
    );

    const rows = (expenseList.data || []).map((expense) => ({
        title: expense.title,
        amount: expense.amount,
        category: categoryMap[expense.categoryId] || 'Unknown',
        type: typeMap[expense.expenseTypeId] || 'Unknown',
        date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : '',
        paymentMethod: expense.paymentMethod || '',
        description: expense.description || '',
    }));

    return {
        rows,
        total: expenseList.total,
        currency,
        generatedFor: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email,
    };
};

const getAiSummary = async (expenseQuery, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [getAiSummary] Generating AI summary`, {
        query: expenseQuery,
        userId,
    });

    try {
        const { rows: enrichedExpenses, currency } = await getEnrichedExpenseRows(
            expenseQuery,
            userId,
            txId
        );

        const summary = await aiService.summarizeExpenses(enrichedExpenses, currency);

        logger.info(`[${txId}] [ExpenseService] [getAiSummary] AI summary generated`, {
            expenseCount: enrichedExpenses.length,
        });

        return summary;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [getAiSummary] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to generate AI summary: ${error.message}`, 500);
    }
};

const exportExpenses = async (expenseQuery, userId, txId) => {
    logger.info(`[${txId}] [ExpenseService] [exportExpenses] Exporting expenses`, {
        query: expenseQuery,
        userId,
    });

    try {
        const { format, ...filters } = expenseQuery;
        const { rows, currency, generatedFor } = await getEnrichedExpenseRows(filters, userId, txId);

        if (!rows.length) {
            throw new AppError('No expenses found matching the selected filters.', 404);
        }

        const file = await expenseReportExport.generateExpenseReport(format, rows, {
            currency,
            generatedFor,
        });

        logger.info(`[${txId}] [ExpenseService] [exportExpenses] Export generated`, {
            format,
            count: rows.length,
        });

        return file;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseService] [exportExpenses] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to export expenses: ${error.message}`, 500);
    }
};

export default {
    getExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    getAiSummary,
    exportExpenses,
};
