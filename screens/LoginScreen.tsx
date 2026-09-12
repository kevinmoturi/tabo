import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AuthForm, type AuthFormValues } from '../components/organisms/AuthForm';
import { TermsSheet } from '../components/organisms/TermsSheet';
import { useSession } from '../src/hooks/useSession';
import { useLoginMutation } from '../src/redux/services/auth';
import type { AuthResponse } from '../src/redux/types';
import { getErrorMessage } from '../src/utils/apiError';
import { showError, showInfo, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const [login, { isLoading }] = useLoginMutation();
  const { persistSession, revokeSession } = useSession();
  // A login the server accepted but the user has not yet agreed to enter.
  // Nothing is stored until they do, so a cold start mid-prompt lands on
  // onboarding rather than in a session that was never accepted.
  const [pending, setPending] = useState<AuthResponse | null>(null);
  const [settling, setSettling] = useState(false);

  const handleSubmit = async (values: AuthFormValues) => {
    try {
      const response = await login({
        body: { email: values.email, password: values.password },
      }).unwrap();
      setPending(response);
    } catch (error) {
      showError(getErrorMessage(error, 'Could not sign you in.'));
    }
  };

  const handleAgree = async () => {
    if (!pending) {
      return;
    }
    setSettling(true);
    try {
      await persistSession(pending);
      showSuccess(`Welcome back, ${pending.user.name}.`);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Home' } }],
      });
    } catch (error) {
      setSettling(false);
      showError(getErrorMessage(error, 'Could not sign you in.'));
    }
  };

  const handleCancel = async () => {
    if (!pending) {
      return;
    }
    const declined = pending;
    setPending(null);
    showInfo('You need to accept the terms to use Tabo.');
    // Server-side cleanup can trail the UI; the user is already out.
    await revokeSession(declined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthForm
            mode="login"
            loading={isLoading}
            onSubmit={handleSubmit}
            onToggleMode={mode => {
              if (mode === 'signup') {
                navigation.navigate('Auth', { screen: 'SignUp' });
              } else if (mode === 'forgot') {
                navigation.navigate('Auth', { screen: 'ForgotPassword' });
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <TermsSheet
        visible={pending !== null}
        busy={settling}
        onAgree={handleAgree}
        onCancel={handleCancel}
      />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
