import { StyleSheet, View } from 'react-native';
import { TaboBadge } from '../atoms/TaboBadge';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

interface EventRowProps {
  time: string;
  latitude?: number;
  longitude?: number;
  status?: 'ok' | 'warn' | 'alert' | 'mist';
}

export function EventRow({
  time,
  latitude,
  longitude,
  status = 'ok',
}: EventRowProps) {
  const coords =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : 'Location unavailable';

  return (
    <View style={styles.row}>
      <TaboBadge tone={status} dotOnly />
      <View style={styles.content}>
        <TaboText variant="body" color={dark.text} style={styles.time}>
          {new Date(time).toLocaleString()}
        </TaboText>
        <TaboText variant="body-sm" color={dark.text3}>
          {coords}
        </TaboText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: dark.surface,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  time: {
    fontWeight: '600',
  },
});
