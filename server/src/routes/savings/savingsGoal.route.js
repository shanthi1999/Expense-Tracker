import express from 'express';
import savingsGoalController from '../../controllers/savingsGoal.controller.js';
import validate from '../../middlewares/validate.js';
import savingsGoalValidator from '../../validators/savingsGoal.validator.js';

const savingsGoalRouter = express.Router();

savingsGoalRouter.post(
    '/',
    validate(savingsGoalValidator.createSavingsGoal),
    savingsGoalController.addSavingsGoal
);
savingsGoalRouter.get(
    '/',
    validate(savingsGoalValidator.getSavingsGoals, 'query'),
    savingsGoalController.getSavingsGoals
);
savingsGoalRouter.patch(
    '/:id/contribute',
    validate(savingsGoalValidator.idParam, 'params'),
    validate(savingsGoalValidator.contributeToGoal),
    savingsGoalController.contributeToGoal
);
savingsGoalRouter.put(
    '/:id',
    validate(savingsGoalValidator.idParam, 'params'),
    validate(savingsGoalValidator.updateSavingsGoal),
    savingsGoalController.updateSavingsGoal
);
savingsGoalRouter.delete(
    '/:id',
    validate(savingsGoalValidator.idParam, 'params'),
    savingsGoalController.deleteSavingsGoal
);

export default savingsGoalRouter;
