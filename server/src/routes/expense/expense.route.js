import express from 'express';
import expenseController from '../../controllers/expense.controller.js';
import validate from '../../middlewares/validate.js';
import expenseValidator from '../../validators/expense.validator.js';

const expenseRouter = express.Router();

expenseRouter.post('/', validate(expenseValidator.createExpense), expenseController.addExpense);
expenseRouter.get(
    '/',
    validate(expenseValidator.getExpenses, 'query'),
    expenseController.getExpense
);
expenseRouter.get(
    '/ai-summary',
    validate(expenseValidator.getAiSummary, 'query'),
    expenseController.getAiSummary
);
expenseRouter.put(
    '/:id',
    validate(expenseValidator.idParam, 'params'),
    validate(expenseValidator.updateExpense),
    expenseController.updateExpense
);
expenseRouter.delete(
    '/:id',
    validate(expenseValidator.idParam, 'params'),
    expenseController.deleteExpense
);

export default expenseRouter;
