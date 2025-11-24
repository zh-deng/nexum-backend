import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url({
    message: 'DATABASE_URL must be a valid URL',
  }),

  PORT: z.coerce.number().default(3000),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  WEB_URL: z.string().min(1, { message: 'WEB_URL must be a valid URL' }),

  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET cannot be empty' }),

  MAIL_HOST: z.string().min(1, { message: 'MAIL_HOST cannot be empty' }),

  MAIL_PORT: z.coerce.number().int().min(1, { message: 'MAIL_PORT must be a valid port number' }),

  MAIL_USER: z
    .email()
    .or(z.string().min(1))
    .refine((value) => value.length > 0, {
      message: 'MAIL_USER cannot be empty',
    }),

  MAIL_PASS: z.string().min(1, { message: 'MAIL_PASS cannot be empty' }),

  COOKIE_DOMAIN: z.string().min(1, { message: 'COOKIE_DOMAIN cannot be empty' }),
});
