import { z } from 'zod';

const hexColor = z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color e.g. #abc or #aabbcc');

export const categorySchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    categoryColorCode: hexColor.optional().or(z.literal('')),
});

export const categoryUpdateSchema = categorySchema.partial().refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== ''),
    { message: 'At least one field must be provided' }
);
