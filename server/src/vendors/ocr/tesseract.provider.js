import Tesseract from 'tesseract.js';
import logger from '../logger/logger.js';

const extractText = async (buffer, txId = 'ocr') => {
    logger.info(`[${txId}] [TesseractOCR] Starting text extraction`);

    const {
        data: { text },
    } = await Tesseract.recognize(buffer, 'eng', {
        logger: () => {},
    });

    const trimmed = text?.trim() || '';
    logger.info(`[${txId}] [TesseractOCR] Extraction complete`, { length: trimmed.length });

    return trimmed;
};

export default { extractText };
