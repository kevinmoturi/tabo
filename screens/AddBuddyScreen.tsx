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
import { useInviteBuddyMutation } from '../src/redux/services/buddies';
import { getErrorCode, getErrorMessage } from '../src/utils/apiError';
import {
  MAX_BUDDIES,
  MAX_BUDDY_NAME_LENGTH,
  isValidEmail,
  normaliseEmail,
} from '../src/utils/buddies';
import { showError, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type AddBuddyNav = NativeStackNavigationProp<RootStackParamList, 'AddBuddy'>;

type Field = 'email' | 'name';
type FieldErrors = Partial<Record<Field, string>>;

/**
 * Nominates a buddy by email. The server emails them and answers 'pending'
 * whether or not the address has a Tambo account, so this screen never learns
 * that either — the buddy's accept is what turns the link active.
 */
export function AddBuddyScreen() {
  const navigation = useNavigation<AddBuddyNav>();
  const { user } = useAuth();
  const [inviteBuddy, { isLoading }] = useInviteBuddyMutation();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Mirrors the server's buddy.schema so obvious mistakes never cost a request.
  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    const cleanEmail = normaliseEmail(email);
    if (!cleanEmail) {
      found.email = 'Email is required.';
    } else if (!isValidEmail(cleanEmail)) {
      found.email = 'Enter a valid email address.';
    } else if (user?.email && cleanEmail === normaliseEmail(user.email)) {
      found.email = 'You cannot add yourself as your own buddy.';
    }
    if (name.trim().length > MAX_BUDDY_NAME_LENGTH) {
      found.name = `Name must be ${MAX_BUDDY_NAME_LENGTH} characters or fewer.`;
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
    const cleanEmail = normaliseEmail(email);
    const cleanName = name.trim();
    try {
      await inviteBuddy({
        body: { email: cleanEmail, ...(cleanName ? { name: cleanName } : {}) },
      }).unwrap();
      showSuccess(`Invitation sent to ${cleanEmail}.`);
      navigation.goBack();
    } catch (error) {
      switch (getErrorCode(error)) {
        case 'buddy_is_self':
          setErrors({ email: 'You cannot add yourself as your own buddy.' });
          return;
        case 'buddy_exists':
          setErrors({ email: 'You have already invited that person.' });
          return;
        case 'buddy_limit_reached':
          showError(`You can have at most ${MAX_BUDDIES} buddies.`);
          navigation.goBack();
          return;
        case 'validation_error':
          setErrors({ email: 'Enter a valid email address.' });
          return;
        default:
          showError(getErrorMessage(error, 'Could not send the invitation.'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Add a buddy" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TaboText variant="body" color={dark.text2} style={styles.intro}>
            We'll email them an invitation. They accept it in the Tambo app —
            if they don't have one yet, signing up with this email will show
            your invitation waiting.
          </TaboText>

          <FormField
            label="Email"
            leftIcon="Mail"
            placeholder="name@example.com"
            value={email}
            onChangeText={value => {
              setEmail(value);
              clearError('email');
            }}
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            containerStyle={styles.field}
          />
          <FormField
            label="Name (optional)"
            leftIcon="User"
            placeholder="How you know them"
            value={name}
            onChangeText={value => {
              setName(value);
              clearError('name');
            }}
            errorMessage={errors.name}
            helper="Shown in your list until they accept; then their own account name is used."
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            maxLength={MAX_BUDDY_NAME_LENGTH}
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
            {isLoading ? 'Sending…' : 'Send invitation'}
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
