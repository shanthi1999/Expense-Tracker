import expenseSchemaModel from '../../models/expenses/expense.model.js';
import logger from '../../vendors/logger/logger.js';

class expenseDbModelApi {
    async getExpenses(filter, limit, skip, sortOption, txId) {
        logger.info(`[${txId}] [ExpenseServiceModel] [getExpenses] Querying expenses`, {
            filter,
            limit,
            skip,
            sortOption,
        });
        try {
            const expenses = await expenseSchemaModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const totalExpenses = await expenseSchemaModel.countDocuments(filter);
            logger.info(`[${txId}] [ExpenseServiceModel] [getExpenses] Query successful`, {
                total: totalExpenses,
            });
            return {
                data: expenses,
                total: totalExpenses,
            };
        } catch (error) {
            logger.error(`[${txId}] [ExpenseServiceModel] [getExpenses] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async getExpense(filter, txId) {
        logger.info(`[${txId}] [ExpenseServiceModel] [getExpense] Fetching single expense`, {
            filter,
        });
        try {
            const expense = await expenseSchemaModel.findOne(filter);
            logger.info(`[${txId}] [ExpenseServiceModel] [getExpense] Fetch complete`, {
                found: !!expense,
            });
            return expense;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseServiceModel] [getExpense] Failed`, {
                filter,
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async createExpense(expenseDocument, txId) {
        logger.info(`[${txId}] [ExpenseServiceModel] [createExpense] Creating expense`, {
            expenseDocument,
        });
        try {
            const expense = new expenseSchemaModel(expenseDocument);
            const saved = await expense.save();
            logger.info(`[${txId}] [ExpenseServiceModel] [createExpense] Expense saved`, {
                expenseId: saved.expenseId,
            });
            return saved;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseServiceModel] [createExpense] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async updateExpense(filter, expenseDocument, txId) {
        logger.info(`[${txId}] [ExpenseServiceModel] [updateExpense] Updating expense`, {
            filter,
            expenseDocument,
        });
        try {
            const updatedExpense = await expenseSchemaModel.findOneAndUpdate(
                filter,
                expenseDocument,
                { new: true }
            );
            logger.info(`[${txId}] [ExpenseServiceModel] [updateExpense] Expense updated`, {
                filter,
                found: !!updatedExpense,
            });
            return updatedExpense;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseServiceModel] [updateExpense] Failed`, {
                filter,
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async deleteExpense(filter, txId) {
        logger.info(`[${txId}] [ExpenseServiceModel] [deleteExpense] Deleting expense`, { filter });
        try {
            const deletedExpense = await expenseSchemaModel.findOneAndDelete(filter);
            logger.info(`[${txId}] [ExpenseServiceModel] [deleteExpense] Expense deleted`, {
                filter,
                found: !!deletedExpense,
            });
            return deletedExpense;
        } catch (error) {
            logger.error(`[${txId}] [ExpenseServiceModel] [deleteExpense] Failed`, {
                filter,
                error: error.message,
            });
            throw new Error(error);
        }
    }
}

export default expenseDbModelApi;
