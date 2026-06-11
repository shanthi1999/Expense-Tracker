import { v2 as cloudinary } from 'cloudinary';

const isPlaceholder = (value) =>
    !value || value === 'your_cloud_name' || value === 'your_api_secret' || value === 'your_api_key';

/** Apply Cloudinary config from env on each use (safe after .env updates + server restart). */
export const configureCloudinary = () => {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudinaryUrl) {
        cloudinary.config({ secure: true });
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
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    return (
        Boolean(cloudinaryUrl) ||
        Boolean(cloudName && apiKey && apiSecret && !isPlaceholder(cloudName) && !isPlaceholder(apiSecret))
    );
};

configureCloudinary();

export default cloudinary;
