import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboIcon } from '../components/atoms/TaboIcon';
import { TaboText } from '../components/atoms/TaboText';
import { FeatureRow } from '../components/molecules/FeatureRow';
import { StatCard } from '../components/molecules/StatCard';
import { AlertBanner } from '../components/organisms/AlertBanner';
import { DashboardHeader } from '../components/organisms/DashboardHeader';
import { DUMMY_ALERT } from '../src/data/dummyEvents';
import { dark, semantic, spacing } from '../src/theme';
import type { MainTabParamList } from '../src/types/navigation';

type HomeNav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <DashboardHeader userName="Tabo user" protectedCount={12} alertCount={1} />
        <View style={styles.section}>
          <AlertBanner
            title={DUMMY_ALERT.title}
            body={DUMMY_ALERT.body}
            onView={() => navigation.navigate('Events')}
            onDismiss={() => {}}
          />
        </View>
        <View style={styles.stats}>
          <StatCard value="12" label="Protected" tone="ok" />
          <StatCard value="1" label="Alert" tone="alert" />
          <StatCard value="48" label="Pings" tone="mist" />
        </View>
        <View style={styles.section}>
          <TaboText variant="h2" color={dark.text} style={styles.sectionTitle}>
            Status
          </TaboText>
          <TaboCard style={styles.statusCard}>
            <View style={styles.statusRow}>
              <TaboIcon name="ShieldCheck" size={24} color={dark.okFg} />
              <TaboText variant="body" color={dark.okFg} style={styles.statusText}>
                Protected
              </TaboText>
            </View>
            <TaboText variant="body-sm" color={dark.text3}>
              Last unlock logged 2 minutes ago.
            </TaboText>
          </TaboCard>
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
            icon="MapPin"
            title="Location logging"
            description="Every unlock is tagged with time and GPS coordinates."
          />
          <FeatureRow
            icon="Bell"
            title="Instant alerts"
            description="Get notified when an unauthorised unlock is detected."
          />
          <FeatureRow
            icon="Eye"
            title="Discreet monitoring"
            description="Runs quietly in the background without draining battery."
          />
        </View>
      </ScrollView>
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
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statusCard: {
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
  action: {
    marginBottom: spacing.sm,
  },
});
