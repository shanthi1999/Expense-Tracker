import mongoose from 'mongoose';
import envConfig from '../../config/env_config.js';

const connectDB = async () => {
    if (!envConfig.database.mongodb.uri) {
        throw new Error('Database COnnection String Missing.');
    }
    try {
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log('Database Connected Successfully');
        });
        connection.on('disconnected', () => {
            console.log('Database Disconnected');
        });
        connection.on('error', (error) => {
            console.log(error);
            process.exit(1);
        });
        await mongoose.connect(envConfig.database.mongodb.uri, {
            dbName: envConfig.database.mongodb.dbName,
            maxPoolSize: 5,
            minPoolSize: 0,
            maxIdleTimeMS: 6000,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default connectDB;
