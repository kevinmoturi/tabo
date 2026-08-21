import { StyleSheet, View } from 'react-native';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

interface StatCardProps {
  value: string;
  label: string;
  tone?: 'default' | 'ok' | 'warn' | 'alert' | 'mist';
}

export function StatCard({ value, label, tone = 'default' }: StatCardProps) {
  const valueColor =
    tone === 'ok'
      ? dark.okFg
      : tone === 'warn'
        ? dark.warnFg
        : tone === 'alert'
          ? dark.alertFg
          : tone === 'mist'
            ? dark.mistFg
            : dark.text;

  return (
    <View style={styles.card}>
      <TaboText variant="h2" color={valueColor} style={styles.value}>
        {value}
      </TaboText>
      <TaboText variant="body-sm" color={dark.text3}>
        {label}
      </TaboText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: dark.border,
    padding: spacing.lg,
    marginRight: spacing.sm,
  },
  value: {
    marginBottom: spacing.xs,
  },
});
