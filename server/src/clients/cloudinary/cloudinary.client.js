import { Readable } from 'node:stream';
import cloudinary, { configureCloudinary } from '../../vendors/cloudinary/cloudinary.js';

const uploadBufferToCloudinary = (buffer, userId) => {
    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'tracker-profiles',
                public_id: `user_${userId}`,
                overwrite: true,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};

export default uploadBufferToCloudinary;
