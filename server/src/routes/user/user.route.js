import express from 'express';
import userController from '../../controllers/user.controller.js';
import validate from '../../middlewares/validate.js';
import authorizeOwner from '../../middlewares/authorizeOwner.js';
import userValidator from '../../validators/user.validator.js';

const userRouter = express.Router();

userRouter.get('/me', userController.getUser);
userRouter.get(
    '/:id',
    validate(userValidator.idParam, 'params'),
    authorizeOwner,
    userController.getUser
);
userRouter.put(
    '/:id',
    validate(userValidator.idParam, 'params'),
    authorizeOwner,
    validate(userValidator.updateUser),
    userController.updateUser
);

export default userRouter;
