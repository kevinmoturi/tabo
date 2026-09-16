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

export type OtpPurpose =
  | 'signup'
  | 'login'
  | 'password_change'
  | 'email_change';

/** A pending 6-digit code; the next move is always /otp/verify. */
export interface OtpChallenge {
  challengeId: string;
  purpose: OtpPurpose;
  expiresInMinutes: number;
}

/**
 * Envelope of every endpoint that opens a challenge — register included: no
 * session exists until the signup code is verified.
 */
export interface ChallengeResponse {
  challenge: OtpChallenge;
}

export interface OtpVerifyBody {
  challengeId: string;
  code: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
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

/** Shapes returned by the Tambo API's /api/v1/buddies and /buddy-invites. */

/**
 * pending  -> invited; awaiting the buddy's in-app accept
 * active   -> accepted; receives alerts
 * declined -> the buddy said no
 * revoked  -> the owner removed them
 */
export type BuddyStatus = 'pending' | 'active' | 'declined' | 'revoked';

/** One of MY buddies — the owner's view of an outgoing invite/link. */
export interface Buddy {
  id: string;
  email: string;
  /** The buddy's account name once linked, else the name I gave when inviting. */
  name: string | null;
  status: BuddyStatus;
  invitedAt: string;
  respondedAt?: string;
}

export interface BuddiesResponse {
  buddies: Buddy[];
}

export interface InviteBuddyBody {
  email: string;
  name?: string;
}

/** Create always answers 'pending' — it never reveals whether the email is registered. */
export interface InviteBuddyResponse {
  buddy: Pick<Buddy, 'id' | 'email' | 'status'>;
}

/** An invitation addressed to ME — the buddy's view. */
export interface BuddyInvite {
  id: string;
  from: { name: string } | null;
  status: BuddyStatus;
  invitedAt: string;
}

export interface BuddyInvitesResponse {
  invites: BuddyInvite[];
}

export type BuddyInviteAction = 'accept' | 'decline';

export interface RespondToInviteResponse {
  invite: Pick<BuddyInvite, 'id' | 'status'>;
}
