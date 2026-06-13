import logger from '../vendors/logger/logger.js';

const responseFlags = {
    parameterMissing: 100,
    actionComplete: 200,
    created: 201,
    accepted: 202,
    badRequest: 400,
    authenticationFailed: 401,
    permissionNotAllowed: 403,
    actionFailed: 410,
    internalServerError: 500,
};

const customResponseFormat = (txId, res, data, statusCode) => {
    const response = {
        success: statusCode < 400,
        statusCode,
        data,
        txId,
    };

    logger.debug(`[${txId}] customResponse: ${JSON.stringify(response)}`);

    return res.status(statusCode).json(response);
};

const apiResponseHelper = {
    customResponseFormat,
    responseFlags,
};

export default apiResponseHelper;
