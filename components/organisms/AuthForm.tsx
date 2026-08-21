import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboLogo } from '../atoms/TaboLogo';
import { TaboText } from '../atoms/TaboText';
import { FormField } from '../molecules/FormField';
import { SocialButton } from '../molecules/SocialButton';
import { dark, spacing } from '../../src/theme';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (email: string, password: string) => void;
  onToggleMode: (mode: AuthMode) => void;
}

export function AuthForm({ mode, onSubmit, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  return (
    <View style={styles.container}>
      <TaboLogo width={80} height={80} style={styles.logo} />
      <TaboText variant="h1" color={dark.text} style={styles.heading}>
        {isLogin ? 'Sign in' : isSignup ? 'Create account' : 'Reset password'}
      </TaboText>
      <TaboText variant="body" color={dark.text2} style={styles.subheading}>
        {isLogin
          ? 'Welcome back. Sign in to keep watching.'
          : isSignup
            ? 'Join Tabo and protect what matters.'
            : 'Enter your email and we will send a reset link.'}
      </TaboText>

      <FormField
        label="Email"
        leftIcon="Mail"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        containerStyle={styles.field}
      />

      {!isForgot ? (
        <FormField
          label="Password"
          leftIcon="Lock"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.field}
        />
      ) : null}

      {isLogin ? (
        <TaboText
          variant="body-sm"
          color={dark.brandOnSurf}
          onPress={() => onToggleMode('forgot')}
          style={styles.link}>
          Forgot password?
        </TaboText>
      ) : null}

      <TaboButton
        onPress={() => onSubmit(email, password)}
        style={styles.submit}>
        {isLogin ? 'Sign in' : isSignup ? 'Create account' : 'Send reset link'}
      </TaboButton>

      {!isForgot ? (
        <>
          <TaboText variant="body-sm" color={dark.text3} align="center" style={styles.or}>
            or
          </TaboText>
          <SocialButton provider="google" onPress={() => {}} />
          <View style={styles.socialSpacer} />
          <SocialButton provider="apple" onPress={() => {}} />
        </>
      ) : null}

      <View style={styles.footer}>
        <TaboText variant="body-sm" color={dark.text3}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
        </TaboText>
        <TaboText
          variant="body-sm"
          color={dark.brandOnSurf}
          onPress={() => onToggleMode(isLogin ? 'signup' : 'login')}>
          {isLogin ? 'Create one' : 'Sign in'}
        </TaboText>
      </View>

      {isForgot ? (
        <View style={styles.footer}>
          <TaboText
            variant="body-sm"
            color={dark.brandOnSurf}
            onPress={() => onToggleMode('login')}>
            Back to sign in
          </TaboText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  heading: {
    marginBottom: spacing.sm,
  },
  subheading: {
    marginBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.md,
  },
  link: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  submit: {
    marginBottom: spacing.lg,
  },
  or: {
    marginVertical: spacing.md,
  },
  socialSpacer: {
    height: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
});
