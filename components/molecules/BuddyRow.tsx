import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { TaboBadge } from '../atoms/TaboBadge';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';
import type { Buddy, BuddyStatus } from '../../src/redux/types';

interface BuddyRowProps {
  buddy: Buddy;
  /** Whether a mutation is in flight for this row; hides the actions. */
  busy?: boolean;
  onRemove?: () => void;
  onReinvite?: () => void;
  style?: StyleProp<ViewStyle>;
}

const STATUS_LABEL: Record<BuddyStatus, string> = {
  pending: 'Invited',
  active: 'Active',
  declined: 'Declined',
  revoked: 'Removed',
};

const STATUS_TONE: Record<
  BuddyStatus,
  React.ComponentProps<typeof TaboBadge>['tone']
> = {
  pending: 'warn',
  active: 'ok',
  declined: 'alert',
  revoked: 'mist',
};

/**
 * One buddy in the owner's list. Live links (pending/active) can be removed;
 * dead ones (declined/revoked) can be invited again — the server reuses the
 * same link, so this never creates a second row.
 */
export function BuddyRow({
  buddy,
  busy,
  onRemove,
  onReinvite,
  style,
}: BuddyRowProps) {
  const isLive = buddy.status === 'pending' || buddy.status === 'active';

  return (
    <View style={[styles.row, style]}>
      <TaboIcon
        name={buddy.status === 'active' ? 'UserCheck' : 'User'}
        size={20}
        color={buddy.status === 'active' ? dark.okFg : dark.text3}
      />
      <View style={styles.text}>
        <TaboText variant="body" color={dark.text} numberOfLines={1}>
          {buddy.name ?? buddy.email}
        </TaboText>
        {buddy.name ? (
          <TaboText variant="body-sm" color={dark.text3} numberOfLines={1}>
            {buddy.email}
          </TaboText>
        ) : null}
        <TaboBadge
          tone={STATUS_TONE[buddy.status]}
          label={STATUS_LABEL[buddy.status]}
          style={styles.badge}
        />
      </View>
      {busy ? (
        <ActivityIndicator size="small" color={dark.text3} />
      ) : isLive && onRemove ? (
        <TaboText variant="body-sm" color={dark.alertFg} onPress={onRemove}>
          Remove
        </TaboText>
      ) : !isLive && onReinvite ? (
        <TaboText
          variant="body-sm"
          color={dark.brandOnSurf}
          onPress={onReinvite}>
          Invite again
        </TaboText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  badge: {
    marginTop: spacing.xs,
  },
});
