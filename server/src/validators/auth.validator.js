import Joi from 'joi';
import userEnums from '../enums/user.enums.js';

const GENDERS = Object.values(userEnums.gender);

const register = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'firstName must be a string',
        'string.min': 'firstName must be at least 2 characters',
        'string.max': 'firstName must be at most 50 characters',
        'any.required': 'firstName is required',
    }),
    lastName: Joi.string().trim().max(50).optional().messages({
        'string.max': 'lastName must be at most 50 characters',
    }),
    email: Joi.string().trim().email().lowercase().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'email is required',
    }),
    password: Joi.string().min(8).max(64).required().messages({
        'string.min': 'password must be at least 8 characters',
        'string.max': 'password must be at most 64 characters',
        'any.required': 'password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'confirmPassword is required',
    }),
    dob: Joi.date().max('now').required().messages({
        'date.base': 'dob must be a valid date',
        'date.max': 'Date of birth cannot be in the future',
        'any.required': 'dob is required',
    }),
    gender: Joi.string()
        .valid(...GENDERS)
        .optional()
        .messages({
            'any.only': `gender must be ${GENDERS.join(' or ')}`,
        }),
    monthlyIncome: Joi.number().min(0).optional().messages({
        'number.min': 'monthlyIncome must be 0 or greater',
    }),
    budget: Joi.number().min(0).optional().messages({
        'number.min': 'budget must be 0 or greater',
    }),
    currency: Joi.string().trim().min(1).max(10).required().messages({
        'any.required': 'currency is required',
    }),
    profileImage: Joi.string().uri().optional().messages({
        'string.uri': 'profileImage must be a valid URL',
    }),
});

const login = Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'password is required',
    }),
});

export default { register, login };
