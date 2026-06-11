import logger from '../vendors/logger/logger.js';

/** Express 5 exposes req.query as read-only — store validated query on req.validatedQuery. */
const applyValidated = (req, source, value) => {
    if (source === 'query') {
        req.validatedQuery = value;
        return;
    }

    if (source === 'params') {
        Object.assign(req.params, value);
        return;
    }

    req[source] = value;
};

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

        applyValidated(req, source, value);
        next();
    };

export default validate;
