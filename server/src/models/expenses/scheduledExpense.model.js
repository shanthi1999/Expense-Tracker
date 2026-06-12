import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import expenseEnums from '../../enums/expense.enums.js';
import scheduledExpenseEnums from '../../enums/scheduledExpense.enums.js';

const scheduledExpenseSchema = new mongoose.Schema(
    {
        scheduledExpenseId: {
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
        description: {
            type: String,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(expenseEnums.paymentMethods),
        },
        frequency: {
            type: String,
            enum: Object.values(scheduledExpenseEnums.frequency),
            default: scheduledExpenseEnums.frequency.monthly,
        },
        dayOfMonth: {
            type: Number,
            required: true,
            min: 1,
            max: 31,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        nextRunAt: {
            type: Date,
            required: true,
            index: true,
        },
        lastRunAt: {
            type: Date,
        },
        reminderSentAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
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

const scheduledExpenseModel = mongoose.model('scheduledExpense', scheduledExpenseSchema);

export default scheduledExpenseModel;
