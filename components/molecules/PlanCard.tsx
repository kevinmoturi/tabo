import { StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  current?: boolean;
  onSelect?: () => void;
}

export function PlanCard({
  name,
  price,
  period,
  features,
  current,
  onSelect,
}: PlanCardProps) {
  return (
    <View style={[styles.card, current && styles.current]}>
      <View style={styles.header}>
        <TaboText variant="h2" color={dark.text}>
          {name}
        </TaboText>
        {current ? (
          <View style={styles.badge}>
            <TaboText variant="label" color={dark.okFg}>
              Current
            </TaboText>
          </View>
        ) : null}
      </View>
      <View style={styles.priceRow}>
        <TaboText variant="display" color={dark.text}>
          {price}
        </TaboText>
        <TaboText variant="body-sm" color={dark.text3}>
          {period}
        </TaboText>
      </View>
      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <TaboText variant="body-sm" color={dark.okFg}>
              {'✓ '}
            </TaboText>
            <TaboText variant="body-sm" color={dark.text2}>
              {feature}
            </TaboText>
          </View>
        ))}
      </View>
      <TaboButton
        variant={current ? 'secondary' : 'primary'}
        onPress={onSelect}
        disabled={current}>
        {current ? 'Active' : 'Choose plan'}
      </TaboButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: dark.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  current: {
    borderColor: dark.okFg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: dark.okWash,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  features: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
});
