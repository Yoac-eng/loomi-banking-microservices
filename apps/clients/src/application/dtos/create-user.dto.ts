import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name is too long'),
  email: z.string().email('Invalid email format').max(254, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(255, 'Password is too long'),
  address: z.string().max(1000, 'Address is too long').optional().nullable(),
  profilePictureUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL is too long')
    .optional()
    .nullable(),
  bankingDetails: z.object({
    agency: z
      .string()
      .min(1, 'Agency is required')
      .max(50, 'Agency is too long'),
    accountNumber: z
      .string()
      .min(1, 'Account number is required')
      .max(50, 'Account number is too long'),
    accountType: z.enum(['CHECKING', 'SAVINGS'], {
      message: 'Account type must be CHECKING or SAVINGS',
    }),
    initialBalance: z
      .number()
      .int('Initial balance must be an integer (cents)')
      .min(0, 'Initial balance cannot be negative')
      .optional(),
  }),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;
