import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Zod schema to validate environment variables securely.
 */
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  GEMINI_API_KEY: z.string().min(1),
  ANALYTICS_BUCKET_SIZE: z.string().optional(),
  ALERT_ESCALATION_THRESHOLD: z.string().optional(),
  ANALYTICS_RETENTION_DAYS: z.string().optional(),
  RAG_TOP_K: z.string().optional(),
  RAG_SIMILARITY_THRESHOLD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
