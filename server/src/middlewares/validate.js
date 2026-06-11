import logger from '../vendors/logger/logger.js';

const validate =
    (schema, source = 'body') =>
    (req, res, next) => {
        const txId = req.id;
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
            logger.warn(`[${txId}] [Validate] Validation failed on ${source}`, { errors });
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        req[source] = value;
        next();
    };

export default validate;
