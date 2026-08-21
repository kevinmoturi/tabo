import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaboText } from '../components/atoms/TaboText';
import { PlanCard } from '../components/molecules/PlanCard';
import { dark, spacing } from '../src/theme';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    features: ['Unlock logging', '7-day event history', 'Email support'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/ month',
    features: [
      'Unlimited event history',
      'Real-time intruder alerts',
      'Location pings every minute',
      'Priority support',
    ],
    current: false,
  },
  {
    name: 'Family',
    price: '$9.99',
    period: '/ month',
    features: [
      'Everything in Pro',
      'Up to 5 devices',
      'Shared dashboard',
      'Premium support',
    ],
    current: false,
  },
];

export function PlansScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <TaboText variant="h1" color={dark.text} style={styles.title}>
          Plans
        </TaboText>
        <TaboText variant="body" color={dark.text2} style={styles.subtitle}>
          Choose the protection that fits you.
        </TaboText>
        <View style={styles.list}>
          {PLANS.map(plan => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              current={plan.current}
              onSelect={() => {}}
            />
          ))}
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
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
});
