import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import scheduledExpenseService from '../service/expense/scheduledExpense.service.js';
import logger from '../vendors/logger/logger.js';

export const runSchedulerTasks = async () => {
    const txId = uuidv4();
    try {
        await scheduledExpenseService.processReminders(txId);
        await scheduledExpenseService.processDueSchedules(txId);
    } catch (error) {
        logger.error(`[${txId}] [Scheduler] Task run failed`, { error: error.message });
    }
};

const startSchedulerJobs = () => {
    cron.schedule('0 * * * *', () => {
        void runSchedulerTasks();
    });

    logger.info('[Scheduler] Scheduled expense jobs started (hourly at minute 0)');
};

export default startSchedulerJobs;
