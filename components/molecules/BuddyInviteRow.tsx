import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';
import type { BuddyInvite } from '../../src/redux/types';

interface BuddyInviteRowProps {
  invite: BuddyInvite;
  /** Whether an answer is in flight for this row; disables both buttons. */
  busy?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  style?: StyleProp<ViewStyle>;
}

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

/**
 * An invitation addressed to me. Accepting means I start receiving that
 * person's theft alerts; there is no other side effect.
 */
export function BuddyInviteRow({
  invite,
  busy,
  onAccept,
  onDecline,
  style,
}: BuddyInviteRowProps) {
  const sender = invite.from?.name ?? 'A Tambo user';
  const when = formatDate(invite.invitedAt);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <TaboIcon name="UserPlus" size={20} color={dark.brandOnSurf} />
        <View style={styles.text}>
          <TaboText variant="body" color={dark.text}>
            {sender} wants you as their buddy
          </TaboText>
          <TaboText variant="body-sm" color={dark.text3}>
            {when ? `Invited ${when}. ` : ''}
            You'll be alerted if their phone is stolen.
          </TaboText>
        </View>
      </View>
      <View style={styles.actions}>
        <TaboButton
          variant="secondary"
          fullWidth={false}
          disabled={busy}
          onPress={onDecline}
          style={styles.action}>
          Decline
        </TaboButton>
        <TaboButton
          fullWidth={false}
          disabled={busy}
          onPress={onAccept}
          style={styles.action}
          leftIcon={
            busy ? (
              <ActivityIndicator size="small" color={dark.onBrand} />
            ) : undefined
          }>
          Accept
        </TaboButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  action: {
    marginLeft: spacing.sm,
    minHeight: 40,
    paddingVertical: spacing.sm,
  },
});
