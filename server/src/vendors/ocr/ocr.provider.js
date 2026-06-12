import ocrEnums from '../../enums/ocr.enums.js';
import tesseractProvider from './tesseract.provider.js';
import AppError from '../../utils/AppError.js';

const extractText = async (buffer, provider, txId) => {
    switch (provider) {
        case ocrEnums.providers.tesseract:
            return tesseractProvider.extractText(buffer, txId);
        case ocrEnums.providers.googleVision:
            throw new AppError(
                'Google Vision OCR is not configured. Set OCR_PROVIDER=TESSERACT or add Google Vision credentials.',
                503
            );
        case ocrEnums.providers.awsTextract:
            throw new AppError(
                'AWS Textract is not configured. Set OCR_PROVIDER=TESSERACT or add AWS credentials.',
                503
            );
        default:
            throw new AppError(`Unknown OCR provider: ${provider}`, 503);
    }
};

export default { extractText };
