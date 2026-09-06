import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboBadge } from '../components/atoms/TaboBadge';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboText } from '../components/atoms/TaboText';
import { Header } from '../components/molecules/Header';
import { useSession } from '../src/hooks/useSession';
import {
  useMeQuery,
  useRevokeSessionMutation,
  useSessionsQuery,
} from '../src/redux/services/auth';
import { getErrorMessage } from '../src/utils/apiError';
import { showError, showSuccess } from '../src/utils/snackbar';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type AccountNav = NativeStackNavigationProp<RootStackParamList, 'Account'>;

const formatDate = (value?: string): string => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <TaboText variant="body-sm" color={dark.text3}>
        {label}
      </TaboText>
      <TaboText variant="body-sm" color={dark.text} style={styles.detailValue}>
        {value}
      </TaboText>
    </View>
  );
}

export function AccountScreen() {
  const navigation = useNavigation<AccountNav>();
  const { signOut } = useSession();

  const {
    data: meData,
    isLoading: meLoading,
    isFetching: meFetching,
    error: meError,
    refetch: refetchMe,
  } = useMeQuery();
  const {
    data: sessionData,
    isFetching: sessionsFetching,
    refetch: refetchSessions,
  } = useSessionsQuery();
  const [revokeSession, { isLoading: revoking }] = useRevokeSessionMutation();

  const user = meData?.user;
  const sessions = sessionData?.sessions ?? [];

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession({ id }).unwrap();
      showSuccess('That device has been signed out.');
    } catch (error) {
      showError(getErrorMessage(error, 'Could not sign that device out.'));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showSuccess('Signed out.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Account" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={meFetching || sessionsFetching}
            onRefresh={() => {
              refetchMe();
              refetchSessions();
            }}
            tintColor={dark.text3}
          />
        }>
        {meLoading ? (
          <ActivityIndicator color={dark.brand} style={styles.loader} />
        ) : meError ? (
          <TaboCard>
            <TaboText variant="body" color={dark.alertFg}>
              {getErrorMessage(meError, 'Could not load your account.')}
            </TaboText>
          </TaboCard>
        ) : user ? (
          <>
            <TaboCard>
              <View style={styles.identity}>
                <View style={styles.identityText}>
                  <TaboText variant="h2" color={dark.text}>
                    {user.name}
                  </TaboText>
                  <TaboText variant="body-sm" color={dark.text3}>
                    {user.email ?? user.phone ?? 'No contact on file'}
                  </TaboText>
                </View>
                <TaboBadge
                  tone={user.emailVerifiedAt ? 'ok' : 'warn'}
                  label={user.emailVerifiedAt ? 'Verified' : 'Unverified'}
                />
              </View>
            </TaboCard>

            <TaboText variant="label" color={dark.text3} style={styles.sectionTitle}>
              AUTH DETAILS
            </TaboText>
            <TaboCard>
              <DetailRow label="User ID" value={user._id} />
              <DetailRow label="Role" value={user.role} />
              <DetailRow
                label="Email verified"
                value={formatDate(user.emailVerifiedAt)}
              />
              <DetailRow label="Member since" value={formatDate(user.createdAt)} />
              <DetailRow label="Last updated" value={formatDate(user.updatedAt)} />
            </TaboCard>

            <TaboText variant="label" color={dark.text3} style={styles.sectionTitle}>
              ACTIVE SESSIONS
            </TaboText>
            <TaboCard>
              {sessions.length === 0 ? (
                <TaboText variant="body-sm" color={dark.text3}>
                  No other sessions.
                </TaboText>
              ) : (
                sessions.map((session, index) => (
                  <View
                    key={session.id}
                    style={[styles.session, index > 0 && styles.sessionDivider]}>
                    <View style={styles.sessionText}>
                      <TaboText variant="body-sm" color={dark.text}>
                        {session.userAgent ?? 'Unknown device'}
                      </TaboText>
                      <TaboText variant="body-sm" color={dark.text3}>
                        Started {formatDate(session.createdAt)}
                      </TaboText>
                    </View>
                    {session.current ? (
                      <TaboBadge tone="brand" label="This device" />
                    ) : (
                      <TaboText
                        variant="body-sm"
                        color={dark.alertFg}
                        onPress={
                          revoking ? undefined : () => handleRevoke(session.id)
                        }>
                        Revoke
                      </TaboText>
                    )}
                  </View>
                ))
              )}
            </TaboCard>
          </>
        ) : null}

        <TaboButton
          variant="alert"
          onPress={handleSignOut}
          style={styles.signOut}>
          Sign out
        </TaboButton>
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
  loader: {
    marginTop: spacing.xxl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identityText: {
    flex: 1,
    marginRight: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  detailValue: {
    flex: 1,
    marginLeft: spacing.md,
    textAlign: 'right',
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sessionDivider: {
    borderTopWidth: 1,
    borderTopColor: dark.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  sessionText: {
    flex: 1,
    marginRight: spacing.md,
  },
  signOut: {
    marginTop: spacing.xxl,
  },
});
