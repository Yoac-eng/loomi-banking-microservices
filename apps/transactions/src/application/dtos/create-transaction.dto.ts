import { z } from 'zod';

export const createTransactionSchema = z.object({
  senderUserId: z.string().uuid('Invalid sender user ID format'),
  receiverUserId: z.string().uuid('Invalid receiver user ID format'),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .int('Amount must be an integer'),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional()
    .nullable(),
  idempotencyKey: z
    .string()
    .min(1, 'Idempotency key is required')
    .max(255, 'Idempotency key is too long'),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
