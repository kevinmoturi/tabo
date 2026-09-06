import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AuthForm, type AuthFormValues } from '../components/organisms/AuthForm';
import { useForgotPasswordMutation } from '../src/redux/services/auth';
import { getErrorMessage } from '../src/utils/apiError';
import { showError, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type ForgotNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotNav>();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (values: AuthFormValues) => {
    try {
      await forgotPassword({ body: { email: values.email } }).unwrap();
      // The API answers 204 for unknown addresses too, so the copy stays
      // deliberately non-committal about whether an account exists.
      showSuccess('If that email is registered, a reset link is on its way.');
      navigation.navigate('Auth', { screen: 'Login' });
    } catch (error) {
      showError(getErrorMessage(error, 'Could not send the reset link.'));
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
            mode="forgot"
            loading={isLoading}
            onSubmit={handleSubmit}
            onToggleMode={mode => {
              if (mode === 'login') {
                navigation.navigate('Auth', { screen: 'Login' });
              } else if (mode === 'signup') {
                navigation.navigate('Auth', { screen: 'SignUp' });
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
