import { StyleSheet, View } from 'react-native';
import { TaboIcon, type IconName } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { TaboPressable } from '../atoms/TaboPressable';
import { dark, spacing } from '../../src/theme';

export interface SettingRowProps {
  icon: IconName;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingRow({
  icon,
  iconColor = dark.text,
  label,
  value,
  onPress,
  destructive,
}: SettingRowProps) {
  const labelColor = destructive ? dark.alertFg : dark.text;
  const chevronColor = dark.text3;

  return (
    <TaboPressable onPress={onPress} style={styles.row}>
      <View style={styles.iconContainer}>
        <TaboIcon name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.content}>
        <TaboText variant="body" color={labelColor}>
          {label}
        </TaboText>
        {value ? (
          <TaboText variant="body-sm" color={dark.text3}>
            {value}
          </TaboText>
        ) : null}
      </View>
      <TaboIcon name="ChevronRight" size={20} color={chevronColor} />
    </TaboPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
