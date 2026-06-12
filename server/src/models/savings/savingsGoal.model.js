import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const savingsGoalSchema = new mongoose.Schema(
    {
        savingsGoalId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        savedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        deadline: {
            type: Date,
            required: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
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

const savingsGoalModel = mongoose.model('savingsGoal', savingsGoalSchema);

export default savingsGoalModel;
