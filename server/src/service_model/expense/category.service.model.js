import categorySchemaModel from '../../models/expenses/category.model.js';
import logger from '../../vendors/logger/logger.js';

class categoryDbModelApi {
    async getCategories(filter, limit, skip, sortOption, txId) {
        logger.info(`[${txId}] [CategoryServiceModel] [getCategories] Querying categories`, {
            filter,
            limit,
            skip,
            sortOption,
        });
        try {
            const categories = await categorySchemaModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const totalCategories = await categorySchemaModel.countDocuments(filter);
            logger.info(`[${txId}] [CategoryServiceModel] [getCategories] Query successful`, {
                total: totalCategories,
            });
            return {
                data: categories,
                total: totalCategories,
            };
        } catch (error) {
            logger.error(`[${txId}] [CategoryServiceModel] [getCategories] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async getCategory(filter, txId) {
        logger.info(`[${txId}] [CategoryServiceModel] [getCategory] Querying category`, { filter });
        try {
            const category = await categorySchemaModel.findOne(filter).lean();
            logger.info(`[${txId}] [CategoryServiceModel] [getCategory] Query successful`, {
                category,
            });
            return category;
        } catch (error) {
            logger.error(`[${txId}] [CategoryServiceModel] [getCategory] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async createCategory(categoryDocument, txId) {
        logger.info(`[${txId}] [CategoryServiceModel] [createCategory] Creating category`, {
            categoryDocument,
        });
        try {
            const category = await categorySchemaModel.create(categoryDocument);
            logger.info(
                `[${txId}] [CategoryServiceModel] [createCategory] Category created successfully`,
                { category }
            );
            return category;
        } catch (error) {
            logger.error(`[${txId}] [CategoryServiceModel] [createCategory] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async updateCategory(categoryId, categoryDocument, userId, txId) {
        logger.info(`[${txId}] [CategoryServiceModel] [updateCategory] Updating category`, {
            categoryId,
            userId,
            categoryDocument,
        });
        try {
            const category = await categorySchemaModel
                .findOneAndUpdate({ categoryId, userId }, categoryDocument, { new: true })
                .lean();
            logger.info(
                `[${txId}] [CategoryServiceModel] [updateCategory] Category updated successfully`,
                { category }
            );
            return category;
        } catch (error) {
            logger.error(`[${txId}] [CategoryServiceModel] [updateCategory] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async deleteCategory(categoryId, userId, txId) {
        logger.info(`[${txId}] [CategoryServiceModel] [deleteCategory] Deleting category`, {
            categoryId,
            userId,
        });
        try {
            const category = await categorySchemaModel
                .findOneAndDelete({ categoryId, userId })
                .lean();
            logger.info(
                `[${txId}] [CategoryServiceModel] [deleteCategory] Category deleted successfully`,
                { category }
            );
            return category;
        } catch (error) {
            logger.error(`[${txId}] [CategoryServiceModel] [deleteCategory] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
}

export default categoryDbModelApi;
