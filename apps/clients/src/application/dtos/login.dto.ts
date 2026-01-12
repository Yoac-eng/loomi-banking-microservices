import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(254, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(255, 'Password is too long'),
});

export type LoginDto = z.infer<typeof loginSchema>;
