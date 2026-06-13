import { v4 as uuidv4 } from 'uuid';

import categoryDbModelApi from '../../service_model/expense/category.service.model.js';

import expenseService from './expense.service.js';

import logger from '../../vendors/logger/logger.js';

import commonEnums from '../../enums/common.enums.js';

import AppError from '../../utils/AppError.js';

const validateCategoryTitle = async (txId, title, userId) => {
    logger.info(
        `[${txId}] [CategoryService] [validateCategoryTitle] Checking if title already exists: ${title}`
    );

    const categoryDBModelApi = new categoryDbModelApi();

    const existing = await categoryDBModelApi.getCategory({ title, userId }, txId);

    if (existing && existing.categoryId) {
        logger.warn(
            `[${txId}] [CategoryService] [validateCategoryTitle] Category already exists: ${title}`
        );

        throw new AppError(`Category already present: ${title}`, 409);
    }

    logger.info(`[${txId}] [CategoryService] [validateCategoryTitle] Title is available: ${title}`);

    return true;
};

const validateCategoryId = async (txId, categoryId, userId) => {
    logger.info(`[${txId}] [CategoryService] [validateCategoryId] Validating category`, {
        categoryId,
        userId,
    });

    const categoryDBModelApi = new categoryDbModelApi();

    const category = await categoryDBModelApi.getCategory({ categoryId, userId }, txId);

    if (!category) {
        logger.warn(`[${txId}] [CategoryService] [validateCategoryId] Category not found`, {
            categoryId,
        });

        throw new AppError(`No category found for id: ${categoryId}`, 404);
    }

    logger.info(`[${txId}] [CategoryService] [validateCategoryId] Category validated`, {
        categoryId,
    });

    return category;
};

const getCategories = async (categoryQuery, userId, txId) => {
    logger.info(`[${txId}] [CategoryService] [getCategories] Fetching categories`, {
        query: categoryQuery,
        userId,
    });

    try {
        const { page = 1, limit = 10, title, sortBy, order } = categoryQuery;

        const categoryDBModelApi = new categoryDbModelApi();

        let filter = { userId };

        let sortOption = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }

        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        }

        const skip = (Number(page) - 1) * Number(limit);

        logger.info(`[${txId}] [CategoryService] [getCategories] Querying DB`, {
            filter,
            skip,
            limit,
            sortOption,
        });

        const categoryList = await categoryDBModelApi.getCategories(
            filter,
            Number(limit),
            skip,
            sortOption,
            txId
        );

        logger.info(`[${txId}] [CategoryService] [getCategories] Categories fetched`, {
            total: categoryList.total,
        });

        return {
            ...categoryList,
            limit: Number(limit),
            page: Number(page),
        };
    } catch (error) {
        logger.error(`[${txId}] [CategoryService] [getCategories] Failed`, {
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching categories: ${error.message}`, 500);
    }
};

const getCategory = async (categoryId, userId, txId) => {
    logger.info(`[${txId}] [CategoryService] [getCategory] Fetching category`, {
        categoryId,
        userId,
    });

    try {
        return await validateCategoryId(txId, categoryId, userId);
    } catch (error) {
        logger.error(`[${txId}] [CategoryService] [getCategory] Failed`, {
            categoryId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Error fetching category: ${error.message}`, 500);
    }
};

const addCategory = async (category, userId, txId) => {
    logger.info(`[${txId}] [CategoryService] [addCategory] Adding category`, {
        title: category.title,
        userId,
    });

    try {
        const categoryDBModelApi = new categoryDbModelApi();

        await validateCategoryTitle(txId, category.title, userId);

        const categoryDocument = {
            ...category,
            categoryId: uuidv4(),
            userId,
        };

        const newCategory = await categoryDBModelApi.createCategory(categoryDocument, txId);

        logger.info(`[${txId}] [CategoryService] [addCategory] Category created successfully`, {
            title: category.title,
        });

        return newCategory;
    } catch (error) {
        logger.error(`[${txId}] [CategoryService] [addCategory] Failed`, {
            title: category.title,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to add category: ${error.message}`, 500);
    }
};

const updateCategory = async (categoryId, categoryData, userId, txId) => {
    logger.info(`[${txId}] [CategoryService] [updateCategory] Updating category`, {
        categoryId,
        userId,
    });

    try {
        const categoryDBModelApi = new categoryDbModelApi();

        await validateCategoryId(txId, categoryId, userId);

        const updatedCategory = await categoryDBModelApi.updateCategory(
            categoryId,
            categoryData,
            userId,
            txId
        );

        logger.info(`[${txId}] [CategoryService] [updateCategory] Category updated successfully`, {
            categoryId,
        });

        return updatedCategory;
    } catch (error) {
        logger.error(`[${txId}] [CategoryService] [updateCategory] Failed`, {
            categoryId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to update category: ${error.message}`, 500);
    }
};

const deleteCategory = async (categoryId, userId, txId) => {
    logger.info(`[${txId}] [CategoryService] [deleteCategory] Deleting category`, {
        categoryId,
        userId,
    });

    try {
        const categoryDBModelApi = new categoryDbModelApi();

        const category = await validateCategoryId(txId, categoryId, userId);

        const mappedExpenses = await expenseService.getExpenses(
            { limit: 1, page: 1 },
            userId,
            txId,
            { categoryId }
        );

        if (mappedExpenses.total > 0) {
            logger.warn(
                `[${txId}] [CategoryService] [deleteCategory] Cannot delete — ${mappedExpenses.total} expense(s) mapped to category`,
                { categoryId, title: category.title }
            );

            throw new AppError(
                `Cannot delete category "${category.title}" as it is mapped to ${mappedExpenses.total} expense(s)`,
                400
            );
        }

        const deletedCategory = await categoryDBModelApi.deleteCategory(categoryId, userId, txId);

        logger.info(`[${txId}] [CategoryService] [deleteCategory] Category deleted successfully`, {
            categoryId,
        });

        return deletedCategory;
    } catch (error) {
        logger.error(`[${txId}] [CategoryService] [deleteCategory] Failed`, {
            categoryId,
            error: error.message,
        });

        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to delete category: ${error.message}`, 500);
    }
};

export default {
    getCategories,
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory,
};
