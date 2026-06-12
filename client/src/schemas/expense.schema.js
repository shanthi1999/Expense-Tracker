import { z } from 'zod';

export const PAYMENT_METHODS = ['UPI', 'CARD', 'CASH', 'NET BANKING'];

export const expenseSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
    categoryId: z.string().uuid('Category is required'),
    expenseTypeId: z.string().uuid('Expense type is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    paymentMethod: z.enum(PAYMENT_METHODS).optional().or(z.literal('')),
    receiptUrl: z.string().url().optional().or(z.literal('')),
});

export const expenseUpdateSchema = expenseSchema.partial().refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== ''),
    { message: 'At least one field must be provided' }
);

export const expenseFilterSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    categoryId: z.string().uuid().optional().or(z.literal('')),
    expenseTypeId: z.string().uuid().optional().or(z.literal('')),
    sortBy: z.enum(['date', 'amount', 'createdAt']).optional().or(z.literal('')),
    order: z.enum(['ASC', 'DESC']).optional().or(z.literal('')),
    dateFrom: z.string().optional().or(z.literal('')),
    dateTo: z.string().optional().or(z.literal('')),
});
