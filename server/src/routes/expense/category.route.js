import express from 'express';
import categoryController from '../../controllers/category.controller.js';
import validate from '../../middlewares/validate.js';
import categoryValidator from '../../validators/category.validator.js';

const categoryRouter = express.Router();

categoryRouter.post(
    '/',
    validate(categoryValidator.createCategory),
    categoryController.addCategory
);
categoryRouter.get(
    '/',
    validate(categoryValidator.getCategories, 'query'),
    categoryController.getCategories
);
categoryRouter.get(
    '/:id',
    validate(categoryValidator.idParam, 'params'),
    categoryController.getCategory
);
categoryRouter.put(
    '/:id',
    validate(categoryValidator.idParam, 'params'),
    validate(categoryValidator.updateCategory),
    categoryController.updateCategory
);
categoryRouter.delete(
    '/:id',
    validate(categoryValidator.idParam, 'params'),
    categoryController.deleteCategory
);

export default categoryRouter;
