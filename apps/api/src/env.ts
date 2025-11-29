import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32).default(() => {
    // In development, generate a random secret
    // In production, this MUST be set as an environment variable
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('⚠️  WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET environment variable for production.');
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  }),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
