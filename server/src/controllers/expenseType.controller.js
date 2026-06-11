import expenseTypeService from '../service/expense/expenseType.service.js';

const addExpenseType = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseType = await expenseTypeService.addExpenseType(
            req.body,
            req.user.userId,
            txId
        );

        res.status(201).json({
            success: true,
            message: 'Expense type created successfully',
            data: expenseType,
        });
    } catch (error) {
        next(error);
    }
};

const getExpenseTypes = async (req, res, next) => {
    const txId = req.id;

    try {
        const expenseTypes = await expenseTypeService.getExpenseTypes(
            req.query,
            req.user.userId,
            txId
        );

        res.status(200).json({
            success: true,
            message: 'Expense types fetched successfully',
            data: expenseTypes,
        });
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

        res.status(200).json({
            success: true,
            message: 'Expense type fetched successfully',
            data: expenseType,
        });
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

        res.status(200).json({
            success: true,
            message: 'Expense type updated successfully',
            data: expenseType,
        });
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

        res.status(200).json({
            success: true,
            message: 'Expense type deleted successfully',
            data: expenseType,
        });
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
