import { StyleSheet, View } from 'react-native';
import { TaboBadge } from '../atoms/TaboBadge';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';

interface DashboardHeaderProps {
  userName?: string;
  protectedCount?: number;
  alertCount?: number;
}

export function DashboardHeader({
  userName = 'there',
  protectedCount = 0,
  alertCount = 0,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.greeting}>
        <TaboText variant="body" color={dark.text3}>
          Good day,
        </TaboText>
        <TaboText variant="h2" color={dark.text}>
          {userName}
        </TaboText>
      </View>
      <View style={styles.status}>
        <TaboBadge tone="ok" label={`${protectedCount} protected`} />
        {alertCount > 0 ? (
          <View style={styles.alertBadge}>
            <TaboBadge tone="alert" label={`${alertCount} alert${alertCount > 1 ? 's' : ''}`} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    flex: 1,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    marginLeft: spacing.sm,
  },
});
