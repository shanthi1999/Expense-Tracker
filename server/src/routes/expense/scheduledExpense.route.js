import express from 'express';
import scheduledExpenseController from '../../controllers/scheduledExpense.controller.js';
import validate from '../../middlewares/validate.js';
import scheduledExpenseValidator from '../../validators/scheduledExpense.validator.js';

const scheduledExpenseRouter = express.Router();

scheduledExpenseRouter.post(
    '/',
    validate(scheduledExpenseValidator.createScheduledExpense),
    scheduledExpenseController.addScheduledExpense
);
scheduledExpenseRouter.get(
    '/',
    validate(scheduledExpenseValidator.getScheduledExpenses, 'query'),
    scheduledExpenseController.getScheduledExpenses
);
scheduledExpenseRouter.post('/process', scheduledExpenseController.processSchedules);
scheduledExpenseRouter.put(
    '/:id',
    validate(scheduledExpenseValidator.idParam, 'params'),
    validate(scheduledExpenseValidator.updateScheduledExpense),
    scheduledExpenseController.updateScheduledExpense
);
scheduledExpenseRouter.delete(
    '/:id',
    validate(scheduledExpenseValidator.idParam, 'params'),
    scheduledExpenseController.deleteScheduledExpense
);

export default scheduledExpenseRouter;
