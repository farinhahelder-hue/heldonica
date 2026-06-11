/**
 * Environment Variables Validation
 * Validates required and optional env vars at startup with clear error messages
 * No external dependencies - uses native TypeScript validation
 */

// =============================================================================
// TYPES
// =============================================================================

export type ServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SERVICE_KEY?: string;
  CMS_PASSWORD?: string;
  CMS_ADMIN_KEY?: string;
  CMS_SESSION_SECRET?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  ADMIN_EMAIL?: string;
  GOOGLE_ANALYTICS_PROPERTY_ID?: string;
  NEXT_PUBLIC_N8N_WEBHOOK_URL?: string;
  CMS_WEBHOOK_URL?: string;
  CRON_SECRET?: string;
  DISCORD_WEBHOOK_URL?: string;
  SLACK_WEBHOOK_URL?: string;
  N8N_WEBHOOK_URL?: string;
  WEBHOOK_CUSTOM?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  AI_AGENT_API_KEY?: string;
  JULES_API_KEY?: string;
  UNSPLASH_APP_ID?: string;
  UNSPLASH_SECRET_KEY?: string;
  BEHOLD_API_KEY?: string;
  INSTAGRAM_ACCESS_TOKEN?: string;
  INSTAGRAM_BUSINESS_ACCOUNT_ID?: string;
  BREVO_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  IDRIVE_CLIENT_ID?: string;
  IDRIVE_CLIENT_SECRET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_S3_BUCKET?: string;
  MONGODB_URI?: string;
  GITHUB_TOKEN?: string;
  N8N_WEBHOOK_AGENTS_URL?: string;
  MAINTENANCE_MODE?: string;
};

export type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_N8N_WEBHOOK_URL?: string;
  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY?: string;
  NEXT_PUBLIC_BEHOLD_FEED_ID?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  INSTAGRAM_USERNAME?: string;
};

// =============================================================================
// VALIDATORS
// =============================================================================

type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: string[];
};

function isValidUrl(value: string | undefined): boolean {
  if (!value) return true; // Optional
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string | undefined): boolean {
  if (!value) return true; // Optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate server environment variables
 * Returns parsed data or list of errors
 */
export function validateServerEnv(): ValidationResult<ServerEnv> {
  const errors: string[] = [];

  const env = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    CMS_PASSWORD: process.env.CMS_PASSWORD,
    CMS_ADMIN_KEY: process.env.CMS_ADMIN_KEY,
    CMS_SESSION_SECRET: process.env.CMS_SESSION_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    GOOGLE_ANALYTICS_PROPERTY_ID: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    CMS_WEBHOOK_URL: process.env.CMS_WEBHOOK_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    WEBHOOK_CUSTOM: process.env.WEBHOOK_CUSTOM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    AI_AGENT_API_KEY: process.env.AI_AGENT_API_KEY,
    JULES_API_KEY: process.env.JULES_API_KEY,
    UNSPLASH_APP_ID: process.env.UNSPLASH_APP_ID,
    UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY,
    BEHOLD_API_KEY: process.env.BEHOLD_API_KEY,
    INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_BUSINESS_ACCOUNT_ID: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IDRIVE_CLIENT_ID: process.env.IDRIVE_CLIENT_ID,
    IDRIVE_CLIENT_SECRET: process.env.IDRIVE_CLIENT_SECRET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    MONGODB_URI: process.env.MONGODB_URI,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    N8N_WEBHOOK_AGENTS_URL: process.env.N8N_WEBHOOK_AGENTS_URL,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
  };

  // Validate URL fields
  const urlFields = [
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'CMS_WEBHOOK_URL',
    'DISCORD_WEBHOOK_URL',
    'SLACK_WEBHOOK_URL',
    'N8N_WEBHOOK_URL',
    'N8N_WEBHOOK_AGENTS_URL',
  ];

  for (const field of urlFields) {
    if (!isValidUrl(env[field as keyof typeof env] as string | undefined)) {
      errors.push(`${field}: doit être une URL valide (ex: https://example.com)`);
    }
  }

  // Validate email fields
  if (!isValidEmail(env.ADMIN_EMAIL)) {
    errors.push('ADMIN_EMAIL: doit être une adresse email valide');
  }

  // Validate MAINTENANCE_MODE
  const validModes = ['0', '1', 'true', 'false', ''];
  if (env.MAINTENANCE_MODE && !validModes.includes(env.MAINTENANCE_MODE)) {
    errors.push('MAINTENANCE_MODE: doit être "0", "1", "true" ou "false"');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: env as ServerEnv };
}

/**
 * Validate client environment variables
 * Returns parsed data or list of errors
 */
export function validateClientEnv(): ValidationResult<ClientEnv> {
  const errors: string[] = [];

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_BEHOLD_FEED_ID: process.env.NEXT_PUBLIC_BEHOLD_FEED_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME,
  };

  // Validate URL fields
  const urlFields = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
    'NEXT_PUBLIC_SITE_URL',
  ];

  for (const field of urlFields) {
    if (!isValidUrl(env[field as keyof typeof env] as string | undefined)) {
      errors.push(`${field}: doit être une URL valide (ex: https://example.com)`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: env as ClientEnv };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get validated server env with throw on error
 * Use this in server-only code that requires env vars
 */
export function getServerEnv(): ServerEnv {
  const result = validateServerEnv();
  if (!result.success) {
    const errorMsg = `Server environment validation failed:\n${result.errors.join('\n')}`;
    throw new Error(errorMsg);
  }
  return result.data;
}

/**
 * Get validated client env with throw on error
 * Use this in client components that require env vars
 */
export function getClientEnv(): ClientEnv {
  const result = validateClientEnv();
  if (!result.success) {
    const errorMsg = `Client environment validation failed:\n${result.errors.join('\n')}`;
    throw new Error(errorMsg);
  }
  return result.data;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceMode(): boolean {
  const mode = process.env.MAINTENANCE_MODE;
  return mode === '1' || mode === 'true';
}

/**
 * Get required env var or throw
 * Use for critical env vars that must be set
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional env var with default
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get all defined environment variables (for debugging)
 * Filters out sensitive values
 */
export function getEnvSummary(): Record<string, 'defined' | 'undefined'> {
  const summary: Record<string, 'defined' | 'undefined'> = {};
  const sensitiveKeys = [
    'KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'API_KEY', 'ACCESS_KEY',
  ];

  for (const [key, value] of Object.entries(process.env)) {
    summary[key] = value !== undefined && value !== '' ? 'defined' : 'undefined';
  }

  return summary;
}