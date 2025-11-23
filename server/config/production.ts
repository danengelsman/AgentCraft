import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  
  // Email configuration (optional in dev, required in prod)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  
  // OpenAI (optional in dev, required in prod)
  OPENAI_API_KEY: z.string().optional(),
  
  // Application URLs
  APP_URL: z.string().url().default('http://localhost:5000'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  AUTH_RATE_LIMIT_MAX: z.string().default('5').transform(Number), // 5 attempts per 15 min for auth
  
  // Security
  CORS_ORIGIN: z.string().default('*'),
  TRUST_PROXY: z.string().default('1').transform(Number),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional production-specific validation
    if (parsed.NODE_ENV === 'production') {
      if (!parsed.RESEND_API_KEY) {
        console.warn('⚠️  WARNING: RESEND_API_KEY not set in production - email features will be disabled');
      }
      if (!parsed.OPENAI_API_KEY) {
        console.warn('⚠️  WARNING: OPENAI_API_KEY not set in production - AI features will be disabled');
      }
      if (parsed.CORS_ORIGIN === '*') {
        console.warn('⚠️  WARNING: CORS_ORIGIN is set to * in production - consider restricting to specific origins');
      }
      if (parsed.SESSION_SECRET.length < 64) {
        console.warn('⚠️  WARNING: SESSION_SECRET should be at least 64 characters in production');
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// Helper to check if we're in production
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

// Feature flags based on environment
export const features = {
  enableEmails: !!config.RESEND_API_KEY,
  enableAI: !!config.OPENAI_API_KEY,
  enableDetailedErrors: !isProduction,
  enableSwagger: !isProduction,
};

export default config;