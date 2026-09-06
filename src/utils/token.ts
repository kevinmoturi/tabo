import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token storage for the Tambo API. The backend hands back an access token
 * (short-lived JWT), an opaque refresh token, and `expiresIn` as a TTL string
 * such as "15m" — so the absolute expiry is computed here and stored alongside.
 */

const ACCESS_KEY = '@tabo/accessToken';
const REFRESH_KEY = '@tabo/refreshToken';
const EXPIRY_KEY = '@tabo/tokenExpiry';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
}

const TTL_UNITS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

/** Turns "15m" / "900" / "7d" into seconds. Falls back to 15 minutes. */
export const ttlToSeconds = (ttl: string | number | undefined): number => {
  if (typeof ttl === 'number' && Number.isFinite(ttl)) {
    return ttl;
  }
  if (typeof ttl === 'string') {
    const match = /^(\d+)\s*([smhd])?$/i.exec(ttl.trim());
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = (match[2] ?? 's').toLowerCase();
      return value * (TTL_UNITS[unit] ?? 1);
    }
  }
  return 15 * 60;
};

export const expiryFromTtl = (ttl: string | number | undefined): number =>
  Math.floor(Date.now() / 1000) + ttlToSeconds(ttl);

export const storeTokens = async (tokens: StoredTokens): Promise<void> => {
  try {
    await AsyncStorage.setMany({
      [ACCESS_KEY]: tokens.accessToken,
      [REFRESH_KEY]: tokens.refreshToken,
      [EXPIRY_KEY]: String(tokens.expiresAt),
    });
  } catch (e) {
    console.log('storeTokens', e);
  }
};

/** The raw access token, whether or not it has expired. */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_KEY);
  } catch (e) {
    console.log('getAccessToken', e);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_KEY);
  } catch (e) {
    console.log('getRefreshToken', e);
    return null;
  }
};

export const getExpiry = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(EXPIRY_KEY);
    if (!value) {
      return null;
    }
    const expiry = parseInt(value, 10);
    return Number.isFinite(expiry) ? expiry : null;
  } catch (e) {
    console.log('getExpiry', e);
    return null;
  }
};

export const isExpired = (expiresAt: number | null): boolean =>
  expiresAt === null || Math.floor(Date.now() / 1000) >= expiresAt;

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeMany([ACCESS_KEY, REFRESH_KEY, EXPIRY_KEY]);
  } catch (e) {
    console.log('clearTokens', e);
  }
};
