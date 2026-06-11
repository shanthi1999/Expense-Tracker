import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import userEnums from '../../enums/user.enums.js';

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            default: () => uuidv4(),
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        dob: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: Object.values(userEnums.gender),
        },
        monthlyIncome: {
            type: Number,
            min: 0,
        },
        budget: {
            type: Number,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: {
            type: String,
            select: false,
            default: null,
        },
    },
    { timestamps: true }
);

const userModel = mongoose.model('user', userSchema);

export default userModel;
