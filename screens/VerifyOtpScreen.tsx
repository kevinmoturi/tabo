import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboIcon } from '../components/atoms/TaboIcon';
import { TaboText } from '../components/atoms/TaboText';
import { Header } from '../components/molecules/Header';
import { useSession } from '../src/hooks/useSession';
import {
  useRequestEmailVerificationMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../src/redux/services/auth';
import type { OtpChallenge } from '../src/redux/types';
import { getErrorCode, getErrorMessage } from '../src/utils/apiError';
import { showError, showInfo, showSuccess } from '../src/utils/snackbar';
import { dark, radii, spacing } from '../src/theme';
import type {
  OtpIntent,
  RootStackParamList,
  RootStackProps,
} from '../src/types/navigation';

type VerifyOtpNav = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;
type VerifyOtpRoute = RootStackProps<'VerifyOtp'>['route'];

const CODE_LENGTH = 6;
/** Mirrors the server's OTP_RESEND_COOLDOWN_SECONDS default. */
const RESEND_COOLDOWN_S = 60;

const COPY: Record<OtpIntent, { title: string; success: string }> = {
  register: {
    title: 'Verify your email',
    success: 'Email verified. Welcome to Tabo.',
  },
  verify_email: {
    title: 'Verify your email',
    success: 'Email verified.',
  },
  change_password: {
    title: 'Confirm your new password',
    success: 'Password updated. Other devices have been signed out.',
  },
};

/** Challenge states the server reports as unrecoverable for this code. */
const DEAD_CHALLENGE_CODES = new Set([
  'invalid_challenge',
  'otp_attempts_exceeded',
]);

/**
 * Collects the 6-digit code for whichever flow opened the challenge. Every
 * successful verify returns a fresh session that replaces the stored one and
 * lands on Home. The intent still matters for copy and for what a burned
 * challenge can do: an email flow can just ask for a new code, a password
 * change has to be re-entered.
 */
export function VerifyOtpScreen() {
  const navigation = useNavigation<VerifyOtpNav>();
  const { params } = useRoute<VerifyOtpRoute>();
  const { intent, email } = params;
  const { adoptSession } = useSession();

  const [challenge, setChallenge] = useState<OtpChallenge | undefined>(
    params.challenge,
  );

  // Nothing to verify — reached with a missing challenge. Bail to somewhere
  // sensible rather than render a screen that cannot succeed.
  useEffect(() => {
    if (challenge) {
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Home' } }],
      });
    }
  }, [challenge, navigation]);
  const [code, setCode] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  // Burned or expired: the only way forward is a brand-new challenge.
  const [dead, setDead] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRef = useRef<TextInputInstance>(null);

  const [verify, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resend, { isLoading: resending }] = useResendOtpMutation();
  const [requestVerification, { isLoading: restarting }] =
    useRequestEmailVerificationMutation();

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Every hook is above this line; the redirect effect handles navigation.
  if (!challenge) {
    return null;
  }

  /**
   * Success always lands on Home with a clean stack: whatever screen opened
   * the challenge (sign-up, account page, password form) is done with.
   */
  const finish = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const handleVerify = async (submitted: string) => {
    if (submitted.length !== CODE_LENGTH || verifying) {
      return;
    }
    setInlineError(null);
    try {
      const response = await verify({
        body: { challengeId: challenge.challengeId, code: submitted },
      }).unwrap();
      await adoptSession(response);
      showSuccess(COPY[intent].success);
      finish();
    } catch (error) {
      const errorCode = getErrorCode(error);
      setCode('');
      if (errorCode && DEAD_CHALLENGE_CODES.has(errorCode)) {
        setDead(true);
        setInlineError(
          errorCode === 'otp_attempts_exceeded'
            ? 'Too many incorrect codes.'
            : 'This code has expired.',
        );
      } else if (errorCode === 'invalid_otp') {
        setInlineError('Incorrect code. Check your email and try again.');
        inputRef.current?.focus();
      } else {
        showError(getErrorMessage(error, 'Could not verify the code.'));
      }
    }
  };

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (inlineError) {
      setInlineError(null);
    }
    if (digits.length === CODE_LENGTH) {
      handleVerify(digits);
    }
  };

  const handleResend = async () => {
    try {
      await resend({ body: { challengeId: challenge.challengeId } }).unwrap();
      setCooldown(RESEND_COOLDOWN_S);
      showInfo('A new code is on its way.');
    } catch (error) {
      const errorCode = getErrorCode(error);
      if (errorCode === 'rate_limited') {
        const retryAfter = (error as { data?: { retryAfter?: number } }).data
          ?.retryAfter;
        setCooldown(retryAfter ?? RESEND_COOLDOWN_S);
      } else if (errorCode === 'invalid_challenge') {
        setDead(true);
        setInlineError('This code has expired.');
      }
      showError(getErrorMessage(error, 'Could not resend the code.'));
    }
  };

  /** No session exists yet for a signup; signing in again issues a new code. */
  const backToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  /**
   * A dead challenge is reopened differently per intent: a signed-in email
   * verification can just ask for another code; a signup has no session, so
   * logging in again is what issues one; a password change carries its
   * pending password on the challenge, so that one has to be re-entered.
   */
  const handleRestart = async () => {
    if (intent === 'change_password') {
      navigation.goBack();
      return;
    }
    if (intent === 'register') {
      showInfo('Sign in again and we will send you a new code.');
      backToLogin();
      return;
    }
    try {
      const { challenge: fresh } = await requestVerification().unwrap();
      setChallenge(fresh);
      setDead(false);
      setInlineError(null);
      setCode('');
      setCooldown(RESEND_COOLDOWN_S);
      showInfo('A new code is on its way.');
      inputRef.current?.focus();
    } catch (error) {
      showError(getErrorMessage(error, 'Could not send a new code.'));
    }
  };

  const handleLater = () => {
    if (intent === 'register') {
      showInfo('Your account is saved. Sign in whenever you are ready to verify.');
      backToLogin();
    } else {
      navigation.goBack();
    }
  };

  const busy = verifying || resending || restarting;
  const slots = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={COPY[intent].title}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.iconCircle}>
            <TaboIcon name="MailCheck" size={32} color={dark.brandOnSurf} />
          </View>
          <TaboText variant="h2" color={dark.text} align="center">
            Check your email
          </TaboText>
          <TaboText
            variant="body"
            color={dark.text2}
            align="center"
            style={styles.body}>
            We sent a {CODE_LENGTH}-digit code to{' '}
            <TaboText variant="body" color={dark.text}>
              {email ?? 'your email address'}
            </TaboText>
            . It expires in {challenge.expiresInMinutes} minutes.
          </TaboText>

          <Pressable
            style={styles.slots}
            onPress={() => inputRef.current?.focus()}
            disabled={dead}>
            {slots.map((digit, index) => {
              const active = !dead && index === Math.min(code.length, CODE_LENGTH - 1);
              return (
                <View
                  key={index}
                  style={[
                    styles.slot,
                    active && styles.slotActive,
                    inlineError && styles.slotError,
                    dead && styles.slotDead,
                  ]}>
                  <TaboText variant="h1" color={dark.text}>
                    {digit}
                  </TaboText>
                </View>
              );
            })}
          </Pressable>
          {/* The real input is invisible; the slots above render its value. */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={CODE_LENGTH}
            autoFocus
            editable={!dead && !verifying}
            caretHidden
            style={styles.hiddenInput}
          />

          {inlineError ? (
            <TaboText
              variant="body-sm"
              color={dark.alertFg}
              align="center"
              style={styles.error}>
              {inlineError}
            </TaboText>
          ) : null}

          {dead ? (
            <TaboButton
              onPress={handleRestart}
              disabled={busy}
              style={styles.primary}
              leftIcon={
                restarting ? (
                  <ActivityIndicator size="small" color={dark.onBrand} />
                ) : undefined
              }>
              {intent === 'verify_email' ? 'Send a new code' : 'Start again'}
            </TaboButton>
          ) : (
            <TaboButton
              onPress={() => handleVerify(code)}
              disabled={code.length !== CODE_LENGTH || busy}
              style={styles.primary}
              leftIcon={
                verifying ? (
                  <ActivityIndicator size="small" color={dark.onBrand} />
                ) : undefined
              }>
              {verifying ? 'Verifying…' : 'Verify'}
            </TaboButton>
          )}

          {!dead ? (
            <TaboButton
              variant="ghost"
              onPress={handleResend}
              disabled={cooldown > 0 || busy}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </TaboButton>
          ) : null}

          {intent !== 'change_password' ? (
            <TaboButton variant="ghost" onPress={handleLater} disabled={busy}>
              Verify later
            </TaboButton>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: dark.brandWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  body: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  slots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slot: {
    width: 48,
    height: 60,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: dark.border,
    backgroundColor: dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    borderColor: dark.brand,
  },
  slotError: {
    borderColor: dark.alertFg,
    backgroundColor: dark.alertWash,
  },
  slotDead: {
    opacity: 0.5,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  error: {
    marginBottom: spacing.md,
  },
  primary: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
