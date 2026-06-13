import scheduledExpenseDbModelApi from '../../service_model/expense/scheduledExpense.service.model.js';
import categoryService from './category.service.js';
import expenseTypeService from './expenseType.service.js';
import expenseService from './expense.service.js';
import notificationService from '../notification/notification.service.js';
import notificationEnums from '../../enums/notification.enums.js';
import scheduleDate from '../../utils/scheduleDate.js';
import logger from '../../vendors/logger/logger.js';
import commonEnums from '../../enums/common.enums.js';
import AppError from '../../utils/AppError.js';

const validateForeignKeys = async (categoryId, expenseTypeId, userId, txId) => {
    await categoryService.getCategory(categoryId, userId, txId);
    await expenseTypeService.getExpenseType(expenseTypeId, userId, txId);
};

const validateScheduledExpense = async (scheduledExpenseId, userId, txId) => {
    const db = new scheduledExpenseDbModelApi();
    const record = await db.getScheduledExpense({ scheduledExpenseId, userId }, txId);

    if (!record) {
        throw new AppError(`No scheduled expense found for ${scheduledExpenseId}`, 404);
    }

    return record;
};

const resolveNextRunAt = (dayOfMonth, startDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > today) {
        return scheduleDate.computeNextRunAt(dayOfMonth, start);
    }

    return scheduleDate.computeNextRunAt(dayOfMonth, new Date());
};

const getScheduledExpenses = async (query, userId, txId) => {
    logger.info(`[${txId}] [ScheduledExpenseService] [getScheduledExpenses] Fetching`, {
        query,
        userId,
    });

    try {
        const { page = 1, limit = 10, isActive, sortBy, order } = query;
        const filter = { userId };

        if (isActive !== undefined) {
            filter.isActive = isActive;
        }

        const sortOption = {};
        if (sortBy) {
            sortOption[sortBy] = commonEnums.getSortDirection(order);
        } else {
            sortOption.nextRunAt = 1;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const db = new scheduledExpenseDbModelApi();
        const result = await db.getScheduledExpenses(filter, Number(limit), skip, sortOption, txId);

        return {
            ...result,
            page: Number(page),
            limit: Number(limit),
        };
    } catch (error) {
        logger.error(`[${txId}] [ScheduledExpenseService] [getScheduledExpenses] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to fetch scheduled expenses: ${error.message}`, 500);
    }
};

const addScheduledExpense = async (payload, userId, txId) => {
    logger.info(`[${txId}] [ScheduledExpenseService] [addScheduledExpense] Creating`, {
        payload,
        userId,
    });

    try {
        await validateForeignKeys(payload.categoryId, payload.expenseTypeId, userId, txId);

        const nextRunAt = resolveNextRunAt(payload.dayOfMonth, payload.startDate);
        const db = new scheduledExpenseDbModelApi();
        const record = await db.createScheduledExpense(
            {
                ...payload,
                userId,
                nextRunAt,
            },
            txId
        );

        await notificationService.createNotification(
            {
                userId,
                type: notificationEnums.types.scheduledExpenseScheduled,
                title: 'Schedule created',
                message: `"${record.title}" is scheduled monthly on day ${record.dayOfMonth}.`,
                metadata: {
                    scheduledExpenseId: record.scheduledExpenseId,
                    nextRunAt: record.nextRunAt,
                },
            },
            txId
        );

        return record;
    } catch (error) {
        logger.error(`[${txId}] [ScheduledExpenseService] [addScheduledExpense] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to create scheduled expense: ${error.message}`, 500);
    }
};

const updateScheduledExpense = async (scheduledExpenseId, payload, userId, txId) => {
    logger.info(`[${txId}] [ScheduledExpenseService] [updateScheduledExpense] Updating`, {
        scheduledExpenseId,
        userId,
    });

    try {
        const db = new scheduledExpenseDbModelApi();
        const existing = await validateScheduledExpense(scheduledExpenseId, userId, txId);

        if (payload.categoryId || payload.expenseTypeId) {
            await validateForeignKeys(
                payload.categoryId || existing.categoryId,
                payload.expenseTypeId || existing.expenseTypeId,
                userId,
                txId
            );
        }

        const updates = { ...payload };

        if (payload.dayOfMonth || payload.startDate) {
            const dayOfMonth = payload.dayOfMonth ?? existing.dayOfMonth;
            const startDate = payload.startDate ?? existing.startDate;
            updates.nextRunAt = resolveNextRunAt(dayOfMonth, startDate);
            updates.reminderSentAt = null;
        }

        return await db.updateScheduledExpense({ scheduledExpenseId, userId }, updates, txId);
    } catch (error) {
        logger.error(`[${txId}] [ScheduledExpenseService] [updateScheduledExpense] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to update scheduled expense: ${error.message}`, 500);
    }
};

const deleteScheduledExpense = async (scheduledExpenseId, userId, txId) => {
    logger.info(`[${txId}] [ScheduledExpenseService] [deleteScheduledExpense] Deleting`, {
        scheduledExpenseId,
        userId,
    });

    try {
        await validateScheduledExpense(scheduledExpenseId, userId, txId);
        const db = new scheduledExpenseDbModelApi();
        return await db.deleteScheduledExpense({ scheduledExpenseId, userId }, txId);
    } catch (error) {
        logger.error(`[${txId}] [ScheduledExpenseService] [deleteScheduledExpense] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to delete scheduled expense: ${error.message}`, 500);
    }
};

const processDueSchedules = async (txId) => {
    const db = new scheduledExpenseDbModelApi();
    const now = new Date();
    const dueSchedules = await db.getDueSchedules(now, txId);

    logger.info(`[${txId}] [ScheduledExpenseService] [processDueSchedules] Processing`, {
        count: dueSchedules.length,
    });

    for (const schedule of dueSchedules) {
        try {
            if (schedule.endDate && new Date(schedule.endDate) < now) {
                await db.updateScheduledExpense(
                    { scheduledExpenseId: schedule.scheduledExpenseId },
                    { isActive: false },
                    txId
                );
                continue;
            }

            const expense = await expenseService.addExpense(
                {
                    title: schedule.title,
                    amount: schedule.amount,
                    categoryId: schedule.categoryId,
                    expenseTypeId: schedule.expenseTypeId,
                    date: now,
                    description: schedule.description,
                    paymentMethod: schedule.paymentMethod,
                },
                schedule.userId,
                txId
            );

            const nextRunAt = scheduleDate.computeNextRunAt(schedule.dayOfMonth, now);

            await db.updateScheduledExpense(
                { scheduledExpenseId: schedule.scheduledExpenseId },
                {
                    lastRunAt: now,
                    nextRunAt,
                    reminderSentAt: null,
                },
                txId
            );

            await notificationService.createNotification(
                {
                    userId: schedule.userId,
                    type: notificationEnums.types.scheduledExpenseCreated,
                    title: 'Scheduled expense recorded',
                    message: `"${schedule.title}" (${schedule.amount}) was added to your expenses.`,
                    metadata: {
                        scheduledExpenseId: schedule.scheduledExpenseId,
                        expenseId: expense.expenseId,
                    },
                },
                txId
            );
        } catch (error) {
            logger.error(`[${txId}] [ScheduledExpenseService] [processDueSchedules] Schedule failed`, {
                scheduledExpenseId: schedule.scheduledExpenseId,
                error: error.message,
            });
        }
    }
};

const processReminders = async (txId) => {
    const db = new scheduledExpenseDbModelApi();
    const now = new Date();
    const upcoming = await db.getUpcomingReminders(now, txId);

    logger.info(`[${txId}] [ScheduledExpenseService] [processReminders] Processing`, {
        count: upcoming.length,
    });

    for (const schedule of upcoming) {
        try {
            await notificationService.createNotification(
                {
                    userId: schedule.userId,
                    type: notificationEnums.types.scheduledExpenseReminder,
                    title: 'Upcoming scheduled expense',
                    message: `"${schedule.title}" (${schedule.amount}) is due tomorrow.`,
                    metadata: {
                        scheduledExpenseId: schedule.scheduledExpenseId,
                        nextRunAt: schedule.nextRunAt,
                    },
                },
                txId
            );

            await db.updateScheduledExpense(
                { scheduledExpenseId: schedule.scheduledExpenseId },
                { reminderSentAt: now },
                txId
            );
        } catch (error) {
            logger.error(`[${txId}] [ScheduledExpenseService] [processReminders] Reminder failed`, {
                scheduledExpenseId: schedule.scheduledExpenseId,
                error: error.message,
            });
        }
    }
};

const runScheduledProcessing = async (txId) => {
    await processReminders(txId);
    await processDueSchedules(txId);
};

export default {
    getScheduledExpenses,
    addScheduledExpense,
    updateScheduledExpense,
    deleteScheduledExpense,
    processDueSchedules,
    processReminders,
    runScheduledProcessing,
};
