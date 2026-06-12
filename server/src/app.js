import './vendors/mongodb/mongoose.plugins.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './vendors/mongodb/mongoose.connect.js';
import addTransactionId from './middlewares/addTransactionId.js';
import sanitizeResponse from './middlewares/sanitizeResponse.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import startSchedulerJobs from './jobs/scheduledExpense.job.js';
import logger from './vendors/logger/logger.js';
// import rateLimiter from './middlewares/rateLimitMiddleware.js'

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(addTransactionId);
app.use(sanitizeResponse);
// app.use(rateLimiter)

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

void (async () => {
    try {
        await connectDB();
        startSchedulerJobs();
    } catch (error) {
        logger.error('[APP] Unable to connect database', { error: error.message });
    }
})();

export default app;
