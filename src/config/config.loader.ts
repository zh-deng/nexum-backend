import { envSchema } from './env.schema';
import { z } from 'zod';

export const validateEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    console.error('❌ Invalid environment variables:', tree);
    process.exit(1);
  }

  return parsed.data;
};
