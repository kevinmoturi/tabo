import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AuthForm, type AuthFormValues } from '../components/organisms/AuthForm';
import { useSession } from '../src/hooks/useSession';
import { useRegisterMutation } from '../src/redux/services/auth';
import { getErrorMessage } from '../src/utils/apiError';
import { showError, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type SignUpNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpNav>();
  const [register, { isLoading }] = useRegisterMutation();
  const { persistSession } = useSession();

  const handleSubmit = async (values: AuthFormValues) => {
    try {
      // Register starts a session immediately — no OTP step for email signup.
      const response = await register({
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      }).unwrap();

      await persistSession(response);
      showSuccess('Your Tabo account is ready.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Home' } }],
      });
    } catch (error) {
      showError(getErrorMessage(error, 'Could not create your account.'));
    }
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
            mode="signup"
            loading={isLoading}
            onSubmit={handleSubmit}
            onToggleMode={mode => {
              if (mode === 'login') {
                navigation.navigate('Auth', { screen: 'Login' });
              } else if (mode === 'forgot') {
                navigation.navigate('Auth', { screen: 'ForgotPassword' });
              }
            }}
          />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
