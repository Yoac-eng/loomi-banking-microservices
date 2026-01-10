import { z } from 'zod';

import { AccountType } from '../../domain/enum/account-type.enum';

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name is too long')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email is too long')
    .optional(),
  address: z.string().max(1000, 'Address is too long').optional().nullable(),
  bankingDetails: z
    .object({
      agency: z
        .string()
        .min(1, 'Agency is required')
        .max(50, 'Agency is too long')
        .optional(),
      accountNumber: z
        .string()
        .min(1, 'Account number is required')
        .max(50, 'Account number is too long')
        .optional(),
      accountType: z
        .enum([AccountType.CHECKING, AccountType.SAVINGS], {
          message: 'Account type must be CHECKING or SAVINGS',
        })
        .optional(),
    })
    .optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
