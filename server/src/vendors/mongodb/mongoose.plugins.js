import mongoose from 'mongoose';

const removeMongoInternals = (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
};

mongoose.plugin((schema) => {
    schema.set('toJSON', {
        transform: removeMongoInternals,
    });

    schema.set('toObject', {
        transform: removeMongoInternals,
    });
});
