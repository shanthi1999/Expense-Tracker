import stripMongoInternals from '../utils/stripMongoInternals.js';

const sanitizeResponse = (_req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => originalJson(stripMongoInternals(body));

    next();
};

export default sanitizeResponse;
