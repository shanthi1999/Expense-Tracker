import logger from '../vendors/logger/logger.js';

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
            const hasUnsupportedFields = error.details.some(
                (detail) => detail.type === 'object.unknown',
            );

            if (hasUnsupportedFields) {
                const unsupportedFields = error.details
                    .filter((detail) => detail.type === 'object.unknown')
                    .map(
                        (detail) =>
                            detail.context.label ?? detail.context.key ?? 'unknown',
                    );

                return res.status(400).json({
                    success: false,
                    message: `The request contains the unsupported field(s): ${unsupportedFields.join(', ')}, please remove those fields and retry`,
                });
            }

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
