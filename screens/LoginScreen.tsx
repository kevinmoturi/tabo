import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AuthForm } from '../components/organisms/AuthForm';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();

  const handleSubmit = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          onToggleMode={mode => {
            if (mode === 'signup') {
              navigation.navigate('Auth', { screen: 'SignUp' });
            } else if (mode === 'forgot') {
              navigation.navigate('Auth', { screen: 'ForgotPassword' });
            }
          }}
        />
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
