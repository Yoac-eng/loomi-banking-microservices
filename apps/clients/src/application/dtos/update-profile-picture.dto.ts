import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;

export const updateProfilePictureSchema = z.object({
  mimetype: z
    .string()
    .refine(
      (mime) =>
        ALLOWED_MIME_TYPES.includes(
          mime as (typeof ALLOWED_MIME_TYPES)[number],
        ),
      {
        message: 'File must be a JPEG or PNG image',
      },
    ),
  size: z
    .number()
    .int('File size must be an integer')
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    ),
});

export type UpdateProfilePictureDto = z.infer<
  typeof updateProfilePictureSchema
>;
