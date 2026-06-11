import mongoose from 'mongoose';

const stripMongoInternals = (value) => {
    if (value == null || typeof value !== 'object') {
        return value;
    }

    if (value instanceof Date) {
        return value;
    }

    if (value instanceof mongoose.Document) {
        return stripMongoInternals(value.toObject());
    }

    if (Array.isArray(value)) {
        return value.map(stripMongoInternals);
    }

    const sanitized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
        if (key === '_id' || key === '__v') {
            continue;
        }

        sanitized[key] = stripMongoInternals(nestedValue);
    }

    return sanitized;
};

export default stripMongoInternals;
