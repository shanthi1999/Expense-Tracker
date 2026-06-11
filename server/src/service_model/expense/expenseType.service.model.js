import expenseTypeSchemaModel from '../../models/expenses/expenseType.js';
import logger from '../../vendors/logger/logger.js';

class expenseTypeDbModelApi {
    async getExpenseTypes(filter, limit, skip, sortOption, txId) {
        logger.info(
            `[${txId}] [ExpenseTypeServiceModel] [getExpenseTypes] Querying expense types`,
            { filter, limit, skip, sortOption }
        );
        try {
            const expenseTypes = await expenseTypeSchemaModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const totalExpenseTypes = await expenseTypeSchemaModel.countDocuments(filter);
            logger.info(`[${txId}] [ExpenseTypeServiceModel] [getExpenseTypes] Query successful`, {
                total: totalExpenseTypes,
            });
            return {
                data: expenseTypes,
                total: totalExpenseTypes,
            };
        } catch (error) {
            logger.error(`[${txId}] [ExpenseTypeServiceModel] [getExpenseTypes] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async getExpenseType(filter, txId) {
        logger.info(`[${txId}] [ExpenseTypeServiceModel] [getExpenseType] Querying expense type`, {
            filter,
        });
        try {
            const expenseType = await expenseTypeSchemaModel.findOne(filter).lean();
            logger.info(`[${txId}] [ExpenseTypeServiceModel] [getExpenseType] Query successful`, {
                expenseType,
            });
            return expenseType;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseTypeServiceModel] [getExpenseType] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async createExpenseType(expenseTypeDocument, txId) {
        logger.info(
            `[${txId}] [ExpenseTypeServiceModel] [createExpenseType] Creating expense type`,
            { expenseTypeDocument }
        );
        try {
            const expenseType = await expenseTypeSchemaModel.create(expenseTypeDocument);
            logger.info(
                `[${txId}] [ExpenseTypeServiceModel] [createExpenseType] Expense type created successfully`,
                { expenseType }
            );
            return expenseType;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseTypeServiceModel] [createExpenseType] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async updateExpenseType(expenseTypeId, expenseTypeDocument, userId, txId) {
        logger.info(
            `[${txId}] [ExpenseTypeServiceModel] [updateExpenseType] Updating expense type`,
            { expenseTypeId, userId, expenseTypeDocument }
        );
        try {
            const expenseType = await expenseTypeSchemaModel
                .findOneAndUpdate({ expenseTypeId, userId }, expenseTypeDocument, { new: true })
                .lean();
            logger.info(
                `[${txId}] [ExpenseTypeServiceModel] [updateExpenseType] Expense type updated successfully`,
                { expenseType }
            );
            return expenseType;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseTypeServiceModel] [updateExpenseType] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
    async deleteExpenseType(expenseTypeId, userId, txId) {
        logger.info(
            `[${txId}] [ExpenseTypeServiceModel] [deleteExpenseType] Deleting expense type`,
            { expenseTypeId, userId }
        );
        try {
            const expenseType = await expenseTypeSchemaModel
                .findOneAndDelete({ expenseTypeId, userId })
                .lean();
            logger.info(
                `[${txId}] [ExpenseTypeServiceModel] [deleteExpenseType] Expense type deleted successfully`,
                { expenseType }
            );
            return expenseType;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseTypeServiceModel] [deleteExpenseType] Failed`, {
                error: error.message,
            });
            throw new Error(error.message);
        }
    }
}
export default expenseTypeDbModelApi;
