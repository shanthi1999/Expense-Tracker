import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
    .object({
        firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
        lastName: z.string().trim().max(50).optional().or(z.literal('')),
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters').max(64),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        dob: z.string().min(1, 'Date of birth is required'),
        gender: z.enum(['MALE', 'FEMALE']).optional().or(z.literal('')),
        monthlyIncome: z.coerce.number().min(0).optional().or(z.literal('')),
        budget: z.coerce.number().min(0).optional().or(z.literal('')),
        currency: z.string().trim().min(1, 'Currency is required').max(10),
        profileImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((data) => !data.dob || new Date(data.dob) <= new Date(), {
        message: 'Date of birth cannot be in the future',
        path: ['dob'],
    });

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().max(50).optional().or(z.literal('')),
    dob: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional().or(z.literal('')),
    monthlyIncome: z.coerce.number().min(0).optional().or(z.literal('')),
    budget: z.coerce.number().min(0).optional().or(z.literal('')),
    currency: z.string().trim().max(10).optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
});
