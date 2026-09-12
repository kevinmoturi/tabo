import { useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboIcon } from '../components/atoms/TaboIcon';
import { TaboText } from '../components/atoms/TaboText';
import { FeatureRow } from '../components/molecules/FeatureRow';
import { StatCard } from '../components/molecules/StatCard';
import { DashboardHeader } from '../components/organisms/DashboardHeader';
import { EmailVerificationBanner } from '../components/organisms/EmailVerificationBanner';
import { TermsSheet } from '../components/organisms/TermsSheet';
import { useTermsGate } from '../src/hooks/useTermsGate';
import { useUnlockAttempts } from '../src/hooks/useUnlockAttempts';
import { useAuth } from '../src/redux/hooks';
import {
  isProtectionActive,
  openSecuritySettings,
  removeDeviceAdmin,
  requestDeviceAdmin,
} from '../src/utils/UnlockAttempts';
import { showError, showInfo, showSuccess } from '../src/utils/snackbar';
import { dark, semantic, spacing } from '../src/theme';
import type { MainTabParamList } from '../src/types/navigation';

type HomeNav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const formatWhen = (at: number): string => new Date(at).toLocaleString();

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { user } = useAuth();
  const { failedAttempts, failedCount, status, refresh } = useUnlockAttempts();
  const terms = useTermsGate();
  const [refreshing, setRefreshing] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const protectionOn = isProtectionActive(status);
  // Order matters: without a screen lock there is nothing to fail, so fixing
  // that comes before asking for device admin.
  const needsScreenLock = !status.deviceSecure;
  const recent = failedAttempts.slice(0, 5);
  const lastAttempt = failedAttempts[0];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSetScreenLock = async () => {
    if (Platform.OS !== 'android') {
      showError('Failed-unlock detection is Android only.');
      return;
    }
    try {
      await openSecuritySettings();
      showInfo('Set a PIN, pattern or password, then come back.');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Could not open settings.',
      );
    }
  };

  const handleEnable = async () => {
    if (Platform.OS !== 'android') {
      showError('Failed-unlock detection is Android only.');
      return;
    }
    try {
      const result = await requestDeviceAdmin();
      if (result.alreadyActive) {
        showSuccess('Protection is already on.');
      } else if (result.opened) {
        // Consent lands out of band; the hook re-reads on foreground.
        showInfo('Approve Tambo on the screen that opens, then come back.');
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Could not open the approval screen.',
      );
    }
    await refresh();
  };

  const handleDisable = () => {
    Alert.alert(
      'Turn off protection?',
      'Failed unlock attempts will no longer be recorded until you turn it back on.',
      [
        { text: 'Keep on', style: 'cancel' },
        {
          text: 'Turn off',
          style: 'destructive',
          onPress: async () => {
            setDisabling(true);
            try {
              await removeDeviceAdmin();
              showInfo('Protection is off.');
            } catch (error) {
              showError(
                error instanceof Error
                  ? error.message
                  : 'Could not turn protection off.',
              );
            }
            await refresh();
            setDisabling(false);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={dark.text3}
          />
        }>
        <DashboardHeader
          userName={user?.name ?? 'Tabo user'}
          protectedCount={protectionOn ? 1 : 0}
          alertCount={status.currentAttemptStreak}
        />

        <EmailVerificationBanner style={styles.verifyBanner} />

        {!protectionOn ? (
          <View style={styles.section}>
            <TaboCard style={styles.warnCard}>
              <View style={styles.statusRow}>
                <TaboIcon name="ShieldAlert" size={24} color={dark.warnFg} />
                <TaboText
                  variant="body"
                  color={dark.warnFg}
                  style={styles.statusText}>
                  {needsScreenLock
                    ? 'No screen lock set'
                    : 'Protection is off'}
                </TaboText>
              </View>
              <TaboText
                variant="body-sm"
                color={dark.text3}
                style={styles.cardBody}>
                {needsScreenLock
                  ? 'This phone unlocks without a PIN, pattern or password, so there is no failed attempt to detect. Set a screen lock first.'
                  : 'Tambo cannot see failed unlock attempts until you approve it as a device admin. Nothing is recorded until you do.'}
              </TaboText>
              <TaboButton
                onPress={needsScreenLock ? handleSetScreenLock : handleEnable}>
                {needsScreenLock ? 'Set a screen lock' : 'Turn on protection'}
              </TaboButton>
            </TaboCard>
          </View>
        ) : (
          <View style={styles.section}>
            <TaboCard style={styles.okCard}>
              <View style={styles.statusRow}>
                <TaboIcon name="ShieldCheck" size={24} color={dark.okFg} />
                <TaboText
                  variant="body"
                  color={dark.okFg}
                  style={styles.statusText}>
                  Protection is on
                </TaboText>
              </View>
              <TaboText
                variant="body-sm"
                color={dark.text3}
                style={styles.cardBody}>
                Failed PIN, pattern and password attempts are being recorded,
                even while the app is closed.
              </TaboText>
              <TaboButton
                variant="secondary"
                disabled={disabling}
                onPress={handleDisable}>
                {disabling ? 'Turning off…' : 'Turn off protection'}
              </TaboButton>
            </TaboCard>
          </View>
        )}

        <View style={styles.stats}>
          <StatCard
            value={String(failedCount)}
            label="Failed unlocks"
            tone={failedCount > 0 ? 'alert' : 'ok'}
          />
          <StatCard
            value={String(status.currentAttemptStreak)}
            label="Since last unlock"
            tone={status.currentAttemptStreak > 0 ? 'warn' : 'ok'}
          />
          <StatCard
            value={protectionOn ? 'On' : 'Off'}
            label="Detection"
            tone={protectionOn ? 'ok' : 'warn'}
          />
        </View>

        <View style={styles.section}>
          <TaboText variant="h2" color={dark.text} style={styles.sectionTitle}>
            Failed unlock attempts
          </TaboText>
          <TaboCard>
            {recent.length === 0 ? (
              <TaboText variant="body-sm" color={dark.text3}>
                {protectionOn
                  ? 'No failed unlock attempts recorded.'
                  : 'Nothing recorded yet — protection is off.'}
              </TaboText>
            ) : (
              recent.map((attempt, index) => (
                <View
                  key={attempt.id}
                  style={[styles.attempt, index > 0 && styles.attemptDivider]}>
                  <TaboIcon name="LockKeyhole" size={20} color={dark.alertFg} />
                  <View style={styles.attemptText}>
                    <TaboText variant="body-sm" color={dark.text}>
                      {formatWhen(attempt.at)}
                    </TaboText>
                    <TaboText variant="body-sm" color={dark.text3}>
                      Attempt {attempt.attemptNo ?? 1} in that run
                    </TaboText>
                  </View>
                </View>
              ))
            )}
          </TaboCard>
          {lastAttempt ? (
            <TaboText
              variant="body-sm"
              color={dark.text3}
              style={styles.footnote}>
              Last attempt {formatWhen(lastAttempt.at)}.
            </TaboText>
          ) : null}
        </View>

        <View style={styles.section}>
          <TaboText variant="h2" color={dark.text} style={styles.sectionTitle}>
            Quick actions
          </TaboText>
          <TaboButton
            onPress={() => navigation.navigate('Events')}
            style={styles.action}>
            View unlock log
          </TaboButton>
          <TaboButton
            variant="secondary"
            onPress={() => navigation.navigate('Plans')}
            style={styles.action}>
            Manage plan
          </TaboButton>
        </View>

        <View style={styles.section}>
          <TaboText variant="h2" color={dark.text} style={styles.sectionTitle}>
            What's included
          </TaboText>
          <FeatureRow
            icon="LockKeyhole"
            title="Failed unlock detection"
            description="PIN, pattern and password attempts are recorded with the time they happened."
          />
          <FeatureRow
            icon="Scan"
            title="Face and fingerprint"
            description="Android does not report failed biometric attempts to apps. A run of them forces the PIN, and those failures are recorded."
          />
          <FeatureRow
            icon="Eye"
            title="Works while closed"
            description="Detection runs without the app open and resumes as soon as the phone is switched on."
          />
        </View>
      </ScrollView>
      <TermsSheet
        visible={terms.visible}
        busy={terms.busy}
        onAgree={terms.agree}
        onCancel={terms.decline}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  scroll: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  verifyBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  warnCard: {
    backgroundColor: dark.warnWash,
    borderColor: semantic.warn,
  },
  okCard: {
    backgroundColor: dark.okWash,
    borderColor: semantic.ok,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusText: {
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: spacing.md,
  },
  attempt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  attemptDivider: {
    borderTopWidth: 1,
    borderTopColor: dark.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  attemptText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  footnote: {
    marginTop: spacing.sm,
  },
  action: {
    marginBottom: spacing.sm,
  },
});
