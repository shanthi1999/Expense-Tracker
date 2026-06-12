import { v2 as cloudinary } from 'cloudinary';
import envConfig from '../../config/env_config.js';

const isPlaceholder = (value) =>
    !value || value === 'your_cloud_name' || value === 'your_api_secret' || value === 'your_api_key';

const getCloudinaryCredentials = () => ({
    url: envConfig.cloudinary?.url,
    cloudName: envConfig.cloudinary?.cloudName,
    apiKey: envConfig.cloudinary?.apiKey,
    apiSecret: envConfig.cloudinary?.apiSecret,
});

/** Apply Cloudinary config from env on each use (safe after .env updates + server restart). */
export const configureCloudinary = () => {
    const { url, cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

    if (url) {
        cloudinary.config({ cloudinary_url: url, secure: true });
        return;
    }

    if (cloudName && apiKey && apiSecret && !isPlaceholder(cloudName) && !isPlaceholder(apiSecret)) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }
};

export const isCloudinaryConfigured = () => {
    const { url, cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

    return (
        Boolean(url) ||
        Boolean(cloudName && apiKey && apiSecret && !isPlaceholder(cloudName) && !isPlaceholder(apiSecret))
    );
};

configureCloudinary();

export default cloudinary;
