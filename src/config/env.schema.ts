import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
