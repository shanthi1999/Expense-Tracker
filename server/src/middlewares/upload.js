import multer from 'multer';
import AppError from '../utils/AppError.js';

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new AppError('Only image files are allowed', 400));
            return;
        }
        cb(null, true);
    },
});

export default imageUpload;
