import categoryService from '../services/expense/category.service.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const addCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.addCategory(req.body, req.user.userId, txId);

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            category,
            apiResponseHelper.responseFlags.created
        );
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    const txId = req.id;

    try {
        const categories = await categoryService.getCategories(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            categories,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const getCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.getCategory(req.params.id, req.user.userId, txId);

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            category,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.body,
            req.user.userId,
            txId
        );

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            category,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.deleteCategory(req.params.id, req.user.userId, txId);

        apiResponseHelper.customResponseFormat(
            txId,
            res,
            category,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    addCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
};
