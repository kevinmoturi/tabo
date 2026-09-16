import type { Buddy } from '../redux/types';

/**
 * Mirrors the backend's `config.buddies.max` (BUDDIES_MAX, default 3). The
 * server is the authority — it answers `buddy_limit_reached` regardless — this
 * only lets the UI grey out "Add" before a wasted request.
 */
export const MAX_BUDDIES = 3;

/** Links that count against the limit and can still become alert recipients. */
export const isLiveBuddy = (buddy: Buddy): boolean =>
  buddy.status === 'pending' || buddy.status === 'active';

/** Same normalisation as the server's zod schema: trim, lowercase, then check. */
export const normaliseEmail = (value: string): string =>
  value.trim().toLowerCase();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value);

/** Server caps the optional display name at 120 characters. */
export const MAX_BUDDY_NAME_LENGTH = 120;
