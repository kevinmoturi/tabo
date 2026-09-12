import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboText } from '../components/atoms/TaboText';
import { FormField } from '../components/molecules/FormField';
import { Header } from '../components/molecules/Header';
import { useAuth } from '../src/redux/hooks';
import { useChangePasswordMutation } from '../src/redux/services/auth';
import { getErrorCode, getErrorMessage } from '../src/utils/apiError';
import { showError } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type ChangePasswordNav = NativeStackNavigationProp<
  RootStackParamList,
  'ChangePassword'
>;

type Field = 'current' | 'next' | 'confirm';
type FieldErrors = Partial<Record<Field, string>>;

/** bcrypt ignores bytes past 72, so the server caps on bytes, not characters. */
const MAX_PASSWORD_BYTES = 72;

const byteLength = (value: string): number => {
  let bytes = 0;
  for (const char of value) {
    const point = char.codePointAt(0) ?? 0;
    bytes += point < 0x80 ? 1 : point < 0x800 ? 2 : point < 0x10000 ? 3 : 4;
  }
  return bytes;
};

/**
 * Step 1 of a password change. Nothing is applied here — the server parks the
 * new password on an OTP challenge and the change lands only once the emailed
 * code is verified.
 */
export function ChangePasswordScreen() {
  const navigation = useNavigation<ChangePasswordNav>();
  const { user } = useAuth();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Mirrors the server's auth.schema so obvious mistakes never cost a request.
  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    if (!current) {
      found.current = 'Current password is required.';
    }
    if (!next) {
      found.next = 'New password is required.';
    } else if (next.length < 8) {
      found.next = 'Password must be at least 8 characters.';
    } else if (byteLength(next) > MAX_PASSWORD_BYTES) {
      found.next = 'Password is too long.';
    } else if (next === current) {
      found.next = 'Choose a password you have not used here.';
    }
    if (confirm !== next) {
      found.confirm = 'Passwords do not match.';
    }
    return found;
  };

  const clearError = (field: Field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    try {
      const { challenge } = await changePassword({
        body: { currentPassword: current, newPassword: next },
      }).unwrap();
      navigation.navigate('VerifyOtp', {
        challenge,
        intent: 'change_password',
        email: user?.email,
      });
    } catch (error) {
      if (getErrorCode(error) === 'invalid_credentials') {
        setErrors({ current: 'Current password is incorrect.' });
        return;
      }
      showError(getErrorMessage(error, 'Could not start the password change.'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Change password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TaboText variant="body" color={dark.text2} style={styles.intro}>
            We'll email a code to{' '}
            <TaboText variant="body" color={dark.text}>
              {user?.email ?? 'your address'}
            </TaboText>{' '}
            to confirm. Once verified, every other device is signed out.
          </TaboText>

          <FormField
            label="Current password"
            leftIcon="Lock"
            secureTextEntry
            value={current}
            onChangeText={value => {
              setCurrent(value);
              clearError('current');
            }}
            errorMessage={errors.current}
            autoComplete="current-password"
            textContentType="password"
            containerStyle={styles.field}
          />
          <FormField
            label="New password"
            leftIcon="KeyRound"
            secureTextEntry
            value={next}
            onChangeText={value => {
              setNext(value);
              clearError('next');
            }}
            errorMessage={errors.next}
            helper="At least 8 characters."
            autoComplete="new-password"
            textContentType="newPassword"
            containerStyle={styles.field}
          />
          <FormField
            label="Confirm new password"
            leftIcon="KeyRound"
            secureTextEntry
            value={confirm}
            onChangeText={value => {
              setConfirm(value);
              clearError('confirm');
            }}
            errorMessage={errors.confirm}
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            containerStyle={styles.field}
          />

          <TaboButton
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submit}
            leftIcon={
              isLoading ? (
                <ActivityIndicator size="small" color={dark.onBrand} />
              ) : undefined
            }>
            {isLoading ? 'Sending code…' : 'Continue'}
          </TaboButton>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  intro: {
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
