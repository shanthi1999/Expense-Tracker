import express from 'express';
import userController from '../../controllers/user.controller.js';
import validate from '../../middlewares/validate.js';
import authValidator from '../../validators/auth.validator.js';

const authRouter = express.Router();

authRouter.post('/register', validate(authValidator.register), userController.addUser);
authRouter.post('/login', validate(authValidator.login), userController.login);
authRouter.post('/refresh-token', userController.refreshToken);
authRouter.post('/logout', userController.logout);

export default authRouter;
