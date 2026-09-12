import type { OtpChallenge } from '../redux/types';

/**
 * The API's failure envelope is `{ code, message, details? }` (see the
 * backend's errorHandler). RTK Query wraps that in `error.data`, but transport
 * failures carry no envelope at all — this flattens both into one string.
 */

interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
  /** Only on `email_unverified`: the signup challenge that completes it. */
  challenge?: OtpChallenge;
}

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const { status, data, error: fetchError } = error as {
    status?: number | string;
    data?: ApiErrorBody | string;
    error?: string;
  };

  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object' && data.message) {
    return data.message;
  }

  // Transport-level failures: no response body was ever parsed.
  if (status === 'FETCH_ERROR') {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  if (status === 'TIMEOUT_ERROR') {
    return 'The request timed out. Please try again.';
  }
  if (fetchError) {
    return fetchError;
  }

  return fallback;
};

export const getErrorCode = (error: unknown): string | undefined => {
  const data = (error as { data?: ApiErrorBody } | undefined)?.data;
  return data && typeof data === 'object' ? data.code : undefined;
};

/** The challenge riding on a `403 email_unverified` login response. */
export const getErrorChallenge = (error: unknown): OtpChallenge | undefined => {
  const data = (error as { data?: ApiErrorBody } | undefined)?.data;
  return data && typeof data === 'object' ? data.challenge : undefined;
};
