'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { generateErrorCode, extractErrorDetails, type ErrorType } from './error-handling';

interface LogErrorParams {
  error: unknown;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  errorType?: ErrorType;
}

/**
 * Log an error to the database and return the error code.
 * This is a server action that can be called from error boundaries.
 */
export async function logError(params: LogErrorParams): Promise<string> {
  const { error, url, userAgent, metadata, errorType } = params;

  const errorCode = generateErrorCode();
  const details = extractErrorDetails(error);

  // Try to get agency ID if user is authenticated
  let agencyId: string | null = null;
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = createAdminClient();
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();
      agencyId = agency?.id || null;
    }
  } catch {
    // Ignore auth errors - user might not be logged in
  }

  // Log to database
  try {
    const supabase = createAdminClient();
    await supabase.from('error_logs').insert({
      error_code: errorCode,
      error_message: details.message,
      error_stack: details.stack,
      error_type: errorType || details.type,
      url: url,
      user_agent: userAgent,
      agency_id: agencyId,
      metadata: metadata || {},
    });
  } catch (dbError) {
    // If we can't log to DB, at least log to console
    console.error('Failed to log error to database:', dbError);
    console.error('Original error:', error);
  }

  return errorCode;
}

/**
 * Log an API error with request context
 */
export async function logApiError(params: {
  error: unknown;
  endpoint: string;
  method: string;
  statusCode?: number;
}): Promise<string> {
  return logError({
    error: params.error,
    url: params.endpoint,
    errorType: 'api',
    metadata: {
      method: params.method,
      statusCode: params.statusCode,
    },
  });
}
