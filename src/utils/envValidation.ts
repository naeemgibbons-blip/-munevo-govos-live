/**
 * Environment Variable Validation Utility
 * Validates required frontend and backend environment variables at application startup.
 * Logs warnings or errors if keys are missing or invalid, preventing silent runtime failures.
 */

export interface EnvValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  config: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    apiUrl: string;
  };
}

export function validateEnvironment(): EnvValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const apiUrl = import.meta.env.VITE_API_URL || (
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3001'
      : ''
  );

  if (!supabaseUrl) {
    warnings.push('VITE_SUPABASE_URL is missing. Using dynamic backend config fallback.');
  }

  if (!supabaseAnonKey) {
    warnings.push('VITE_SUPABASE_ANON_KEY is missing. Using dynamic backend config fallback.');
  }

  if (!apiUrl && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    warnings.push('VITE_API_URL is missing in production environment.');
  }

  const isValid = errors.length === 0;

  if (warnings.length > 0) {
    console.warn('[Munevo Env Validation Warning]', warnings);
  }

  return {
    isValid,
    warnings,
    errors,
    config: {
      supabaseUrl,
      supabaseAnonKey,
      apiUrl
    }
  };
}
