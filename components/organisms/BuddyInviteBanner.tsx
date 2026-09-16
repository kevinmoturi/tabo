import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboCard } from '../atoms/TaboCard';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboPressable } from '../atoms/TaboPressable';
import { TaboText } from '../atoms/TaboText';
import { useAuth } from '../../src/redux/hooks';
import { useBuddyInvitesQuery } from '../../src/redux/services/buddies';
import { dark, spacing } from '../../src/theme';
import type { RootStackParamList } from '../../src/types/navigation';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

interface BuddyInviteBannerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Nudge when someone has nominated me and is waiting on an answer. Renders
 * nothing when there is nothing pending, so callers can mount it
 * unconditionally. Answering happens on the Buddies screen.
 */
export function BuddyInviteBanner({ style }: BuddyInviteBannerProps) {
  const navigation = useNavigation<RootNav>();
  const { isAuthenticated } = useAuth();
  const { data } = useBuddyInvitesQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const invites = data?.invites ?? [];
  if (invites.length === 0) {
    return null;
  }

  const first = invites[0].from?.name ?? 'Someone';
  const title =
    invites.length === 1
      ? `${first} wants you as their buddy`
      : `${invites.length} people want you as their buddy`;

  return (
    <TaboPressable onPress={() => navigation.navigate('Buddies')}>
      <TaboCard style={[styles.card, style]}>
        <View style={styles.row}>
          <TaboIcon name="UserPlus" size={24} color={dark.brandOnSurf} />
          <View style={styles.text}>
            <TaboText variant="body" color={dark.text} style={styles.title}>
              {title}
            </TaboText>
            <TaboText variant="body-sm" color={dark.text3}>
              Accept to be alerted if their phone is stolen.
            </TaboText>
          </View>
          <TaboIcon name="ChevronRight" size={20} color={dark.text3} />
        </View>
      </TaboCard>
    </TaboPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.brandWash,
    borderColor: dark.brand,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
});
