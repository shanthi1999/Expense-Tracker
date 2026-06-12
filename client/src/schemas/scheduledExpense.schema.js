import { z } from 'zod';
import { PAYMENT_METHODS } from './expense.schema';

export const scheduledExpenseSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
    categoryId: z.string().uuid('Category is required'),
    expenseTypeId: z.string().uuid('Expense type is required'),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    paymentMethod: z.enum(PAYMENT_METHODS).optional().or(z.literal('')),
    frequency: z.enum(['MONTHLY']).default('MONTHLY'),
    dayOfMonth: z.coerce.number().int().min(1).max(31),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional().or(z.literal('')),
});

export const scheduledExpenseUpdateSchema = scheduledExpenseSchema
    .partial()
    .extend({ isActive: z.boolean().optional() })
    .refine((data) => Object.values(data).some((v) => v !== undefined && v !== ''), {
        message: 'At least one field must be provided',
    });
