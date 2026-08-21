import { StyleSheet, View, type ViewStyle } from 'react-native';
import { TaboText } from './TaboText';
import { dark, radii, spacing } from '../../src/theme';

type BadgeTone = 'ok' | 'warn' | 'alert' | 'brand' | 'mist';

interface TaboBadgeProps {
  tone?: BadgeTone;
  label?: string;
  dotOnly?: boolean;
  style?: ViewStyle;
}

export function TaboBadge({
  tone = 'brand',
  label,
  dotOnly = false,
  style,
}: TaboBadgeProps) {
  const colors = toneColors[tone];

  return (
    <View
      style={[
        styles.container,
        dotOnly ? styles.dotOnly : null,
        { backgroundColor: colors.wash },
        style,
      ]}>
      <View style={[styles.dot, { backgroundColor: colors.fg }]} />
      {!dotOnly && label ? (
        <TaboText variant="label" color={colors.fg} style={styles.label}>
          {label}
        </TaboText>
      ) : null}
    </View>
  );
}

const toneColors: Record<BadgeTone, { fg: string; wash: string }> = {
  ok: { fg: dark.okFg, wash: dark.okWash },
  warn: { fg: dark.warnFg, wash: dark.warnWash },
  alert: { fg: dark.alertFg, wash: dark.alertWash },
  brand: { fg: dark.brandOnSurf, wash: dark.brandWash },
  mist: { fg: dark.mistFg, wash: dark.mistWash },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  dotOnly: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    marginLeft: spacing.xs,
  },
});
