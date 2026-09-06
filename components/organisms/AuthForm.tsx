import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboLogo } from '../atoms/TaboLogo';
import { TaboText } from '../atoms/TaboText';
import { FormField } from '../molecules/FormField';
import { SocialButton } from '../molecules/SocialButton';
import { dark, spacing } from '../../src/theme';

type AuthMode = 'login' | 'signup' | 'forgot';

export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (values: AuthFormValues) => void;
  onToggleMode: (mode: AuthMode) => void;
  loading?: boolean;
}

type FieldErrors = Partial<Record<keyof AuthFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({
  mode,
  onSubmit,
  onToggleMode,
  loading = false,
}: AuthFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  // Mirrors the server's auth.schema so obvious mistakes never cost a request.
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (isSignup && !name.trim()) {
      next.name = 'Name is required.';
    }
    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!isForgot) {
      if (!password) {
        next.password = 'Password is required.';
      } else if (isSignup && password.length < 8) {
        next.password = 'Password must be at least 8 characters.';
      }
    }

    return next;
  };

  const handleSubmit = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const clearError = (field: keyof AuthFormValues) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

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

      {isSignup ? (
        <FormField
          label="Name"
          leftIcon="User"
          placeholder="Your name"
          autoCapitalize="words"
          textContentType="name"
          value={name}
          onChangeText={text => {
            setName(text);
            clearError('name');
          }}
          errorMessage={errors.name}
          editable={!loading}
          containerStyle={styles.field}
        />
      ) : null}

      <FormField
        label="Email"
        leftIcon="Mail"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        value={email}
        onChangeText={text => {
          setEmail(text);
          clearError('email');
        }}
        errorMessage={errors.email}
        editable={!loading}
        containerStyle={styles.field}
      />

      {!isForgot ? (
        <FormField
          label="Password"
          leftIcon="Lock"
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          textContentType={isSignup ? 'newPassword' : 'password'}
          value={password}
          onChangeText={text => {
            setPassword(text);
            clearError('password');
          }}
          errorMessage={errors.password}
          helper={
            isSignup && !errors.password ? 'At least 8 characters.' : undefined
          }
          editable={!loading}
          onSubmitEditing={handleSubmit}
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
        onPress={handleSubmit}
        disabled={loading}
        leftIcon={
          loading ? <ActivityIndicator size="small" color={dark.onBrand} /> : undefined
        }
        style={styles.submit}>
        {loading
          ? 'Please wait…'
          : isLogin
            ? 'Sign in'
            : isSignup
              ? 'Create account'
              : 'Send reset link'}
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
