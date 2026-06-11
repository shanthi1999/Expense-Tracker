import { z } from 'zod';

const hexColor = z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color');

export const expenseTypeSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100),
    description: z.string().trim().min(1, 'Description is required').max(500),
    categoryColorCode: hexColor.optional().or(z.literal('')),
});

export const expenseTypeUpdateSchema = expenseTypeSchema.partial().refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== ''),
    { message: 'At least one field must be provided' }
);
