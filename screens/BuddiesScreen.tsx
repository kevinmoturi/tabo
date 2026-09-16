import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboIcon } from '../components/atoms/TaboIcon';
import { TaboText } from '../components/atoms/TaboText';
import { BuddyInviteRow } from '../components/molecules/BuddyInviteRow';
import { BuddyRow } from '../components/molecules/BuddyRow';
import { Header } from '../components/molecules/Header';
import {
  useBuddiesQuery,
  useBuddyInvitesQuery,
  useInviteBuddyMutation,
  useRemoveBuddyMutation,
  useRespondToInviteMutation,
} from '../src/redux/services/buddies';
import { MAX_BUDDIES, isLiveBuddy } from '../src/utils/buddies';
import { getErrorCode, getErrorMessage } from '../src/utils/apiError';
import { showError, showInfo, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { Buddy, BuddyInviteAction } from '../src/redux/types';
import type { RootStackParamList } from '../src/types/navigation';

type BuddiesNav = NativeStackNavigationProp<RootStackParamList, 'Buddies'>;

/**
 * Both halves of the buddy system on one screen: invitations waiting for MY
 * answer at the top (the urgent part), then the people I have nominated to
 * receive my alerts. Nominating lives on its own screen for the keyboard.
 */
export function BuddiesScreen() {
  const navigation = useNavigation<BuddiesNav>();

  const {
    data: buddyData,
    isLoading: buddiesLoading,
    isFetching: buddiesFetching,
    error: buddiesError,
    refetch: refetchBuddies,
  } = useBuddiesQuery();
  const {
    data: inviteData,
    isFetching: invitesFetching,
    refetch: refetchInvites,
  } = useBuddyInvitesQuery();
  const [removeBuddy] = useRemoveBuddyMutation();
  const [inviteBuddy] = useInviteBuddyMutation();
  const [respond] = useRespondToInviteMutation();

  // Per-row busy state, so acting on one buddy does not freeze the others.
  const [busyId, setBusyId] = useState<string | null>(null);

  const buddies = buddyData?.buddies ?? [];
  const invites = inviteData?.invites ?? [];
  const liveCount = buddies.filter(isLiveBuddy).length;
  const canAddMore = liveCount < MAX_BUDDIES;

  const handleRespond = async (id: string, action: BuddyInviteAction) => {
    setBusyId(id);
    try {
      await respond({ id, action }).unwrap();
      if (action === 'accept') {
        showSuccess("You're now their buddy. You'll be alerted if their phone is stolen.");
      } else {
        showInfo('Invitation declined.');
      }
    } catch (error) {
      if (getErrorCode(error) === 'invite_not_found') {
        // Already answered elsewhere, or the owner withdrew it.
        showInfo('That invitation is no longer open.');
        refetchInvites();
        return;
      }
      showError(getErrorMessage(error, 'Could not answer the invitation.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = (buddy: Buddy) => {
    const who = buddy.name ?? buddy.email;
    Alert.alert(
      `Remove ${who}?`,
      buddy.status === 'active'
        ? 'They will stop receiving your theft alerts.'
        : 'The invitation will be withdrawn.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setBusyId(buddy.id);
            try {
              await removeBuddy({ id: buddy.id }).unwrap();
              showInfo(`${who} removed.`);
            } catch (error) {
              showError(getErrorMessage(error, 'Could not remove that buddy.'));
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const handleReinvite = async (buddy: Buddy) => {
    if (!canAddMore) {
      showError(`You can have at most ${MAX_BUDDIES} buddies.`);
      return;
    }
    setBusyId(buddy.id);
    try {
      await inviteBuddy({
        body: { email: buddy.email, ...(buddy.name ? { name: buddy.name } : {}) },
      }).unwrap();
      showSuccess(`Invitation sent to ${buddy.email}.`);
    } catch (error) {
      showError(getErrorMessage(error, 'Could not send the invitation.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buddies"
        onBack={() => navigation.goBack()}
        rightAction={
          canAddMore
            ? { icon: 'UserPlus', onPress: () => navigation.navigate('AddBuddy') }
            : undefined
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={buddiesFetching || invitesFetching}
            onRefresh={() => {
              refetchBuddies();
              refetchInvites();
            }}
            tintColor={dark.text3}
          />
        }>
        <TaboText variant="body" color={dark.text2} style={styles.intro}>
          A buddy is someone Tambo alerts if your phone is stolen, so they can
          help you act quickly. They must have a Tambo account and accept in
          the app.
        </TaboText>

        {invites.length > 0 ? (
          <>
            <TaboText variant="label" color={dark.text3} style={styles.sectionTitle}>
              INVITATIONS FOR YOU
            </TaboText>
            <TaboCard style={styles.inviteCard}>
              {invites.map((invite, index) => (
                <BuddyInviteRow
                  key={invite.id}
                  invite={invite}
                  busy={busyId === invite.id}
                  onAccept={() => handleRespond(invite.id, 'accept')}
                  onDecline={() => handleRespond(invite.id, 'decline')}
                  style={index > 0 ? styles.divider : undefined}
                />
              ))}
            </TaboCard>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <TaboText variant="label" color={dark.text3}>
            YOUR BUDDIES
          </TaboText>
          <TaboText variant="label" color={dark.text3}>
            {liveCount} of {MAX_BUDDIES}
          </TaboText>
        </View>

        {buddiesLoading ? (
          <ActivityIndicator color={dark.brand} style={styles.loader} />
        ) : buddiesError ? (
          <TaboCard>
            <TaboText variant="body" color={dark.alertFg}>
              {getErrorMessage(buddiesError, 'Could not load your buddies.')}
            </TaboText>
          </TaboCard>
        ) : buddies.length === 0 ? (
          <TaboCard style={styles.empty}>
            <TaboIcon name="Users" size={32} color={dark.text3} />
            <TaboText
              variant="body"
              color={dark.text}
              align="center"
              style={styles.emptyTitle}>
              No buddies yet
            </TaboText>
            <TaboText variant="body-sm" color={dark.text3} align="center">
              Add someone you trust. If your phone is stolen, they'll get the
              alert with your last known location and evidence.
            </TaboText>
          </TaboCard>
        ) : (
          <TaboCard>
            {buddies.map((buddy, index) => (
              <BuddyRow
                key={buddy.id}
                buddy={buddy}
                busy={busyId === buddy.id}
                onRemove={() => handleRemove(buddy)}
                onReinvite={() => handleReinvite(buddy)}
                style={index > 0 ? styles.divider : undefined}
              />
            ))}
          </TaboCard>
        )}

        <TaboButton
          onPress={() => navigation.navigate('AddBuddy')}
          disabled={!canAddMore || buddiesLoading}
          style={styles.add}
          leftIcon={<TaboIcon name="UserPlus" size={20} color={dark.onBrand} />}>
          {canAddMore ? 'Add a buddy' : `Limit of ${MAX_BUDDIES} reached`}
        </TaboButton>
        {!canAddMore ? (
          <TaboText
            variant="body-sm"
            color={dark.text3}
            align="center"
            style={styles.footnote}>
            Remove a buddy to invite someone else.
          </TaboText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  intro: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  inviteCard: {
    backgroundColor: dark.brandWash,
    borderColor: dark.brand,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  empty: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: dark.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  add: {
    marginTop: spacing.xl,
  },
  footnote: {
    marginTop: spacing.sm,
  },
});
