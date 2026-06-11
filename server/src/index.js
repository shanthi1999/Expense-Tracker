import app from './app.js';
import envConfig from './config/env_config.js';
import logger from './vendors/logger/logger.js';

app.listen(envConfig.port, () => {
    logger.info(`Server Listening on Port: ${envConfig.port}`);
});
