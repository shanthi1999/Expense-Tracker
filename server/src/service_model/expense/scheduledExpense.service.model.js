import scheduledExpenseModel from '../../models/expenses/scheduledExpense.model.js';
import logger from '../../vendors/logger/logger.js';

class scheduledExpenseDbModelApi {
    async getScheduledExpenses(filter, limit, skip, sortOption, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [getScheduledExpenses] Querying`,
            { filter, limit, skip, sortOption }
        );
        try {
            const data = await scheduledExpenseModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const total = await scheduledExpenseModel.countDocuments(filter);
            return { data, total };
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [getScheduledExpenses] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async getScheduledExpense(filter, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [getScheduledExpense] Fetching`,
            { filter }
        );
        try {
            return await scheduledExpenseModel.findOne(filter);
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [getScheduledExpense] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async getDueSchedules(now, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [getDueSchedules] Fetching due schedules`,
            { now }
        );
        try {
            return await scheduledExpenseModel
                .find({
                    isActive: true,
                    nextRunAt: { $lte: now },
                })
                .lean();
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [getDueSchedules] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async getUpcomingReminders(now, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [getUpcomingReminders] Fetching reminders`,
            { now }
        );
        try {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            return await scheduledExpenseModel
                .find({
                    isActive: true,
                    nextRunAt: { $gt: now, $lte: tomorrow },
                    $or: [{ reminderSentAt: null }, { reminderSentAt: { $exists: false } }],
                })
                .lean();
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [getUpcomingReminders] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async createScheduledExpense(document, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [createScheduledExpense] Creating`,
            { document }
        );
        try {
            const record = new scheduledExpenseModel(document);
            return await record.save();
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [createScheduledExpense] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async updateScheduledExpense(filter, document, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [updateScheduledExpense] Updating`,
            { filter, document }
        );
        try {
            return await scheduledExpenseModel.findOneAndUpdate(filter, document, { new: true });
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [updateScheduledExpense] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }

    async deleteScheduledExpense(filter, txId) {
        logger.info(
            `[${txId}] [ScheduledExpenseServiceModel] [deleteScheduledExpense] Deleting`,
            { filter }
        );
        try {
            return await scheduledExpenseModel.findOneAndDelete(filter);
        } catch (error) {
            logger.error(
                `[${txId}] [ScheduledExpenseServiceModel] [deleteScheduledExpense] Failed`,
                { error: error.message }
            );
            throw new Error(error);
        }
    }
}

export default scheduledExpenseDbModelApi;
