import { z } from 'zod';

export const savingsGoalSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    targetAmount: z.coerce.number().min(1, 'Target must be at least 1'),
    savedAmount: z.coerce.number().min(0).optional(),
    deadline: z.string().min(1, 'Deadline is required'),
    description: z.string().trim().max(500).optional().or(z.literal('')),
});

export const savingsGoalUpdateSchema = savingsGoalSchema.partial().refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== ''),
    { message: 'At least one field must be provided' }
);

export const contributeSchema = z.object({
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
});
