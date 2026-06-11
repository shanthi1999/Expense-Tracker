import mongoose from 'mongoose';
import categoryEnums from '../../enums/category.enums.js';

const categorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        categoryColorCode: {
            type: String,
            default: categoryEnums.colorCodes.default,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.index({ userId: 1, title: 1 }, { unique: true });

const categoryModel = mongoose.model('category', categorySchema);
export default categoryModel;
