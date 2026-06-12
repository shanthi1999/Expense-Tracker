import express from 'express';
import expenseController from '../../controllers/expense.controller.js';
import validate from '../../middlewares/validate.js';
import expenseValidator from '../../validators/expense.validator.js';
import imageUpload from '../../middlewares/upload.js';

const expenseRouter = express.Router();

expenseRouter.post('/', validate(expenseValidator.createExpense), expenseController.addExpense);
expenseRouter.post(
    '/scan-receipt',
    imageUpload.single('receipt'),
    expenseController.scanReceipt
);
expenseRouter.post(
    '/parse-voice',
    validate(expenseValidator.parseVoiceExpense),
    expenseController.parseVoiceExpense
);
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
expenseRouter.get(
    '/export',
    validate(expenseValidator.exportExpenses, 'query'),
    expenseController.exportExpenseReport
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
