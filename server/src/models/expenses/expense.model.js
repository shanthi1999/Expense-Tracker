import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import expenseEnums from '../../enums/expense.enums.js';

const expenseSchema = new mongoose.Schema(
    {
        expenseId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        categoryId: {
            type: String,
            required: true,
            index: true,
        },
        expenseTypeId: {
            type: String,
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(expenseEnums.paymentMethods),
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const expenseSchemaModel = mongoose.model('expense', expenseSchema);

export default expenseSchemaModel;
