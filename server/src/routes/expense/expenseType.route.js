import express from 'express';
import expenseTypeController from '../../controllers/expenseType.controller.js';
import validate from '../../middlewares/validate.js';
import expenseTypeValidator from '../../validators/expenseType.validator.js';

const expenseTypeRouter = express.Router();

expenseTypeRouter.post(
    '/',
    validate(expenseTypeValidator.createExpenseType),
    expenseTypeController.addExpenseType
);
expenseTypeRouter.get(
    '/',
    validate(expenseTypeValidator.getExpenseTypes, 'query'),
    expenseTypeController.getExpenseTypes
);
expenseTypeRouter.get(
    '/:id',
    validate(expenseTypeValidator.idParam, 'params'),
    expenseTypeController.getExpenseType
);
expenseTypeRouter.put(
    '/:id',
    validate(expenseTypeValidator.idParam, 'params'),
    validate(expenseTypeValidator.updateExpenseType),
    expenseTypeController.updateExpenseType
);
expenseTypeRouter.delete(
    '/:id',
    validate(expenseTypeValidator.idParam, 'params'),
    expenseTypeController.deleteExpenseType
);

export default expenseTypeRouter;
