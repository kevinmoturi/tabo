import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAuth } from '../redux/hooks';
import {
  useLazyMeQuery,
  useRequestEmailVerificationMutation,
} from '../redux/services/auth';
import { setUser } from '../redux/slices/authSlice';
import { getErrorCode, getErrorMessage } from '../utils/apiError';
import { showError, showInfo } from '../utils/snackbar';
import type { RootStackParamList } from '../types/navigation';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

/**
 * The "verify your email" nudge, shared by every surface that shows it. Asks
 * the server for a fresh code and hands off to the OTP screen; the slice's
 * `emailVerifiedAt` is what decides whether the nudge is shown at all.
 */
export const useEmailVerification = () => {
  const navigation = useNavigation<RootNav>();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const [request, { isLoading }] = useRequestEmailVerificationMutation();
  const [fetchMe] = useLazyMeQuery();

  const needsVerification =
    isAuthenticated && !!user?.email && !user.emailVerifiedAt;

  const start = useCallback(async () => {
    try {
      const { challenge } = await request().unwrap();
      navigation.navigate('VerifyOtp', {
        challenge,
        intent: 'verify_email',
        email: user?.email,
      });
    } catch (error) {
      if (getErrorCode(error) === 'email_already_verified') {
        // The slice is stale — another device finished it. Pulling /me in
        // brings the verified timestamp with it and drops the nudge.
        showInfo('Your email is already verified.');
        try {
          const { user: fresh } = await fetchMe().unwrap();
          dispatch(setUser({ user: fresh }));
        } catch (refreshError) {
          console.log('useEmailVerification', refreshError);
        }
        return;
      }
      showError(getErrorMessage(error, 'Could not send a verification code.'));
    }
  }, [dispatch, fetchMe, navigation, request, user?.email]);

  return { needsVerification, start, starting: isLoading };
};
