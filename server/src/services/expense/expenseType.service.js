import { v4 as uuidv4 } from 'uuid';

import expenseTypeDbModelApi from '../../service_model/expense/expenseType.service.model.js';

import expenseService from './expense.service.js';

import logger from '../../vendors/logger/logger.js';

import commonEnums from '../../enums/common.enums.js';

import AppError from '../../utils/AppError.js';

const validateExpenseType = async (txId, title, userId) => {
    logger.info(
        `[${txId}] [ExpenseTypeService] [validateExpenseType] Checking if title already exists: ${title}`
    );

    const expenseTypeDBModelApi = new expenseTypeDbModelApi();

    const result = await expenseTypeDBModelApi.getExpenseType({ title, userId }, txId);

    if (result && result.expenseTypeId) {
        logger.warn(
            `[${txId}] [ExpenseTypeService] [validateExpenseType] Expense type already exists: ${title}`
        );

        throw new AppError(`Expense type already present: ${title}`, 409);
    }

    logger.info(
        `[${txId}] [ExpenseTypeService] [validateExpenseType] Title is available: ${title}`
    );

    return true;
};

const validateExpenseTypeId = async (txId, expenseTypeId, userId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [validateExpenseTypeId] Validating expense type`, {
        expenseTypeId,
        userId,
    });

    const expenseTypeDBModelApi = new expenseTypeDbModelApi();

    const expenseType = await expenseTypeDBModelApi.getExpenseType({ expenseTypeId, userId }, txId);

    if (!expenseType) {
        logger.warn(
            `[${txId}] [ExpenseTypeService] [validateExpenseTypeId] Expense type not found`,
            {
                expenseTypeId,
            }
        );

        throw new AppError(`No expense type found for id: ${expenseTypeId}`, 404);
    }

    logger.info(`[${txId}] [ExpenseTypeService] [validateExpenseTypeId] Expense type validated`, {
        expenseTypeId,
    });

    return expenseType;
};

const getExpenseTypes = async (expenseTypeQuery, userId, txId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [getExpenseTypes] Fetching expense types`, {
        query: expenseTypeQuery,
        userId,
    });

    try {
        const { page = 1, limit = 10, title, sortBy, order } = expenseTypeQuery;

        const expenseTypeDBModelApi = new expenseTypeDbModelApi();

        let filter = { userId };

        let sortOption = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }

        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        }

        const skip = (Number(page) - 1) * Number(limit);

        logger.info(`[${txId}] [ExpenseTypeService] [getExpenseTypes] Querying DB`, {
            filter,
            skip,
            limit,
            sortOption,
        });

        const expenseTypeList = await expenseTypeDBModelApi.getExpenseTypes(
            filter,
            Number(limit),
            skip,
            sortOption,
            txId
        );

        logger.info(`[${txId}] [ExpenseTypeService] [getExpenseTypes] Expense types fetched`, {
            total: expenseTypeList.total,
        });

        return {
            ...expenseTypeList,
            limit: Number(limit),
            page: Number(page),
        };
    } catch (error) {
        logger.error(`[${txId}] [ExpenseTypeService] [getExpenseTypes] Failed`, {
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching expense types: ${error.message}`, 500);
    }
};

const getExpenseType = async (expenseTypeId, userId, txId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [getExpenseType] Fetching expense type`, {
        expenseTypeId,
        userId,
    });

    try {
        return await validateExpenseTypeId(txId, expenseTypeId, userId);
    } catch (error) {
        logger.error(`[${txId}] [ExpenseTypeService] [getExpenseType] Failed`, {
            expenseTypeId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching expense type: ${error.message}`, 500);
    }
};

const addExpenseType = async (expenseType, userId, txId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [addExpenseType] Adding expense type`, {
        title: expenseType.title,
        userId,
    });

    try {
        const expenseTypeDBModelApi = new expenseTypeDbModelApi();

        await validateExpenseType(txId, expenseType.title, userId);

        const expenseTypeDocument = {
            ...expenseType,
            expenseTypeId: uuidv4(),
            userId,
        };

        const newExpenseType = await expenseTypeDBModelApi.createExpenseType(
            expenseTypeDocument,
            txId
        );

        logger.info(
            `[${txId}] [ExpenseTypeService] [addExpenseType] Expense type created successfully`,
            { title: expenseType.title }
        );

        return newExpenseType;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseTypeService] [addExpenseType] Failed`, {
            title: expenseType.title,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to add expense type: ${error.message}`, 500);
    }
};

const updateExpenseType = async (expenseTypeId, expenseTypeData, userId, txId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [updateExpenseType] Updating expense type`, {
        expenseTypeId,
        userId,
    });

    try {
        const expenseTypeDBModelApi = new expenseTypeDbModelApi();

        await validateExpenseTypeId(txId, expenseTypeId, userId);

        const updatedExpenseType = await expenseTypeDBModelApi.updateExpenseType(
            expenseTypeId,
            expenseTypeData,
            userId,
            txId
        );

        logger.info(
            `[${txId}] [ExpenseTypeService] [updateExpenseType] Expense type updated successfully`,
            { expenseTypeId }
        );

        return updatedExpenseType;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseTypeService] [updateExpenseType] Failed`, {
            expenseTypeId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to update expense type: ${error.message}`, 500);
    }
};

const deleteExpenseType = async (expenseTypeId, userId, txId) => {
    logger.info(`[${txId}] [ExpenseTypeService] [deleteExpenseType] Deleting expense type`, {
        expenseTypeId,
        userId,
    });

    try {
        const expenseTypeDBModelApi = new expenseTypeDbModelApi();

        await validateExpenseTypeId(txId, expenseTypeId, userId);

        const mappedExpenses = await expenseService.getExpenses(
            { limit: 1, page: 1 },
            userId,
            txId,
            { expenseTypeId }
        );

        if (mappedExpenses.total > 0) {
            logger.warn(
                `[${txId}] [ExpenseTypeService] [deleteExpenseType] Cannot delete — ${mappedExpenses.total} expense(s) mapped to expense type`,
                { expenseTypeId }
            );

            throw new AppError(
                `Cannot delete expense type as it is mapped to ${mappedExpenses.total} expense(s)`,
                400
            );
        }

        const deletedExpenseType = await expenseTypeDBModelApi.deleteExpenseType(
            expenseTypeId,
            userId,
            txId
        );

        logger.info(
            `[${txId}] [ExpenseTypeService] [deleteExpenseType] Expense type deleted successfully`,
            { expenseTypeId }
        );

        return deletedExpenseType;
    } catch (error) {
        logger.error(`[${txId}] [ExpenseTypeService] [deleteExpenseType] Failed`, {
            expenseTypeId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to delete expense type: ${error.message}`, 500);
    }
};

export default {
    getExpenseTypes,
    getExpenseType,
    addExpenseType,
    updateExpenseType,
    deleteExpenseType,
};
