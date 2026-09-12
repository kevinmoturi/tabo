import { useCallback } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { api } from '../redux/services';
import { useLogoutMutation } from '../redux/services/auth';
import { clearUser, setUser } from '../redux/slices/authSlice';
import type { AuthResponse } from '../redux/types';
import {
  clearTokens,
  expiryFromTtl,
  getRefreshToken,
  storeTokens,
} from '../utils/token';

/**
 * The two ends of a session. Register and login both produce the same
 * envelope, so persisting it lives in one place; signing out always clears
 * local state even when the server call fails, so a user is never stuck in a
 * signed-in shell they cannot leave.
 */
export const useSession = () => {
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const persistSession = useCallback(
    async (response: AuthResponse) => {
      const expiresAt = expiryFromTtl(response.tokens.expiresIn);
      await storeTokens({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt,
      });
      dispatch(setUser({ user: response.user, expiresAt }));
    },
    [dispatch],
  );

  /**
   * Swaps the stored session for the fresh pair every /otp/verify returns.
   * The pair being replaced is revoked first (best effort — a password change
   * has already killed it server-side, and logout is idempotent) so a verified
   * signup does not leave its registration session alive for a month.
   */
  const adoptSession = useCallback(
    async (response: AuthResponse) => {
      const previous = await getRefreshToken();
      if (previous && previous !== response.tokens.refreshToken) {
        try {
          await logout({ body: { refreshToken: previous } }).unwrap();
        } catch (error) {
          console.log('adoptSession', error);
        }
      }
      await persistSession(response);
    },
    [logout, persistSession],
  );

  const signOut = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await logout({ body: { refreshToken } }).unwrap();
      } catch (error) {
        // A revoked or expired token is already the state we want; anything
        // else is a network failure we cannot let block the local sign-out.
        console.log('logout', error);
      }
    }
    await clearTokens();
    dispatch(clearUser());
    dispatch(api.util.resetApiState());
  }, [dispatch, logout]);

  return { persistSession, adoptSession, signOut };
};
