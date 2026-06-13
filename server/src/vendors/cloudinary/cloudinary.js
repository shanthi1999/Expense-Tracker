import { v2 as cloudinary } from 'cloudinary';
import envConfig from '../../config/env_config.js';

const getCloudinaryCredentials = () => ({
    url: envConfig.cloudinary?.url,
    cloudName: envConfig.cloudinary?.cloudName,
    apiKey: envConfig.cloudinary?.apiKey,
    apiSecret: envConfig.cloudinary?.apiSecret,
});

export const isCloudinaryConfigured = () => {
    const { url, cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

    return Boolean(url || (cloudName && apiKey && apiSecret));
};

export const configureCloudinary = () => {
    const { url, cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

    if (url) {
        cloudinary.config({ cloudinary_url: url, secure: true });
        return;
    }

    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }
};

configureCloudinary();

export default cloudinary;
