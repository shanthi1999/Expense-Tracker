import expenseTypeService from '../services/expense/expenseType.service.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const addExpenseType = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseType = await expenseTypeService.addExpenseType(
            req.body,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenseType,
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const getExpenseTypes = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseTypes = await expenseTypeService.getExpenseTypes(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenseTypes,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const getExpenseType = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseType = await expenseTypeService.getExpenseType(
            req.params.id,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenseType,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const updateExpenseType = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseType = await expenseTypeService.updateExpenseType(
            req.params.id,
            req.body,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenseType,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const deleteExpenseType = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseType = await expenseTypeService.deleteExpenseType(
            req.params.id,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            expenseType,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    addExpenseType,
    getExpenseTypes,
    getExpenseType,
    updateExpenseType,
    deleteExpenseType,
};
