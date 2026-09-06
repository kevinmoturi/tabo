import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AuthForm, type AuthFormValues } from '../components/organisms/AuthForm';
import { useSession } from '../src/hooks/useSession';
import { useLoginMutation } from '../src/redux/services/auth';
import { getErrorMessage } from '../src/utils/apiError';
import { showError, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const [login, { isLoading }] = useLoginMutation();
  const { persistSession } = useSession();

  const handleSubmit = async (values: AuthFormValues) => {
    try {
      const response = await login({
        body: { email: values.email, password: values.password },
      }).unwrap();

      await persistSession(response);
      showSuccess(`Welcome back, ${response.user.name}.`);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Home' } }],
      });
    } catch (error) {
      showError(getErrorMessage(error, 'Could not sign you in.'));
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
