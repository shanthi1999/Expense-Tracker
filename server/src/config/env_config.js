import dotenv from 'dotenv';
dotenv.config();

const envConfig = {
    port: process.env.PORT || 8000,
    database: {
        mongodb: {
            uri: `${process.env.DB_URI.replace('<DB_PASSWORD>', process.env.DB_PASSWORD).replace(
                '<DB_NAME>',
                process.env.DB_NAME
            )}`,
            dbName: process.env.DB_NAME,
        },
    },
    jwt: {
        access: {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        },
        refresh: {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        },
    },
    bcrypt: {
        secrets: {
            saltRounds: 10,
        },
    },
};
export default envConfig;
