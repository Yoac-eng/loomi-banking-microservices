import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name is too long'),
  email: z.string().email('Invalid email format').max(254, 'Email is too long'),
  address: z.string().max(1000, 'Address is too long').optional().nullable(),
  profilePictureUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL is too long')
    .optional()
    .nullable(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;
