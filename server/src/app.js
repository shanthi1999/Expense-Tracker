import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './vendors/mongodb/mongoose.connect.js';
import addTransactionId from './middlewares/addTransactionId.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import logger from './vendors/logger/logger.js';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(addTransactionId);

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

void (async () => {
    try {
        await connectDB();
    } catch (error) {
        logger.error('[APP] Unable to connect database', { error: error.message });
    }
})();

export default app;
