import categoryService from '../service/expense/category.service.js';

const addCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.addCategory(req.body, req.user.userId, txId);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    const txId = req.id;

    try {
        const categories = await categoryService.getCategories(req.query, req.user.userId, txId);

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

const getCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.getCategory(req.params.id, req.user.userId, txId);

        res.status(200).json({
            success: true,
            message: 'Category fetched successfully',
            data: category,
        });
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

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    const txId = req.id;

    try {
        const category = await categoryService.deleteCategory(req.params.id, req.user.userId, txId);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: category,
        });
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
