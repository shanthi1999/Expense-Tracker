import { Readable } from 'node:stream';
import { v4 as uuidv4 } from 'uuid';
import cloudinary, { configureCloudinary } from '../../vendors/cloudinary/cloudinary.js';

const uploadBufferToCloudinary = (buffer, options) => {
    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                ...options,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

const uploadProfileImage = (buffer, userId) =>
    uploadBufferToCloudinary(buffer, {
        folder: 'tracker-profiles',
        public_id: `user_${userId}`,
        overwrite: true,
    });

const uploadReceiptImage = (buffer, userId) =>
    uploadBufferToCloudinary(buffer, {
        folder: 'tracker-receipts',
        public_id: `receipt_${userId}_${uuidv4()}`,
    });

export default uploadProfileImage;
export { uploadReceiptImage };
