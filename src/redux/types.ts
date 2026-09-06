/** Shapes returned by the Tambo API's /api/auth endpoints. */

export interface AuthUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** TTL string such as "15m", not an absolute timestamp. */
  expiresIn: string;
}

/** Envelope shared by register, login, refresh and reset-password. */
export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface MeResponse {
  user: AuthUser;
}

export interface AuthSession {
  id: string;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export interface SessionsResponse {
  sessions: AuthSession[];
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}
