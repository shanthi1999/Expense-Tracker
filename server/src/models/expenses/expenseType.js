import mongoose from 'mongoose';
import categoryEnums from '../../enums/category.enums.js';

const expenseTypeSchema = new mongoose.Schema(
    {
        expenseTypeId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
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

expenseTypeSchema.index({ userId: 1, title: 1 }, { unique: true });

const expenseTypeModel = mongoose.model('expenseType', expenseTypeSchema);

export default expenseTypeModel;
