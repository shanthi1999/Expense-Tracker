import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import notificationEnums from '../../enums/notification.enums.js';

const notificationSchema = new mongoose.Schema(
    {
        notificationId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(notificationEnums.types),
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const notificationModel = mongoose.model('notification', notificationSchema);

export default notificationModel;
