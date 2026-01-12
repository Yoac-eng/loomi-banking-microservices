import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public (skips JWT authentication).
 */
export function Public(): ReturnType<typeof SetMetadata> {
  return SetMetadata(IS_PUBLIC_KEY, true);
}
