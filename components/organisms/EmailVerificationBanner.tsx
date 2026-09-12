import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboCard } from '../atoms/TaboCard';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { useEmailVerification } from '../../src/hooks/useEmailVerification';
import { dark, semantic, spacing } from '../../src/theme';

interface EmailVerificationBannerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Nudge for a signed-in account whose email was never proven. Renders nothing
 * once `emailVerifiedAt` is set, so callers can mount it unconditionally.
 */
export function EmailVerificationBanner({ style }: EmailVerificationBannerProps) {
  const { needsVerification, start, starting } = useEmailVerification();

  if (!needsVerification) {
    return null;
  }

  return (
    <TaboCard style={[styles.card, style]}>
      <View style={styles.row}>
        <TaboIcon name="MailWarning" size={24} color={dark.warnFg} />
        <TaboText variant="body" color={dark.warnFg} style={styles.title}>
          Verify your email
        </TaboText>
      </View>
      <TaboText variant="body-sm" color={dark.text3} style={styles.body}>
        Alerts and account recovery go to your email, so we need to know it
        reaches you. We'll send a 6-digit code to confirm.
      </TaboText>
      <TaboButton
        onPress={start}
        disabled={starting}
        leftIcon={
          starting ? (
            <ActivityIndicator size="small" color={dark.onBrand} />
          ) : undefined
        }>
        {starting ? 'Sending code…' : 'Verify now'}
      </TaboButton>
    </TaboCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.warnWash,
    borderColor: semantic.warn,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  body: {
    marginBottom: spacing.md,
  },
});
