import { StyleSheet, View } from 'react-native';
import { TaboIcon, type IconName } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { TaboPressable } from '../atoms/TaboPressable';
import { dark, spacing } from '../../src/theme';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: { icon: IconName; onPress: () => void };
}

export function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <TaboPressable onPress={onBack} style={styles.iconButton}>
            <TaboIcon name="ChevronLeft" size={28} color={dark.text} />
          </TaboPressable>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <TaboText variant="h3" color={dark.text}>
            {title}
          </TaboText>
        ) : null}
      </View>
      <View style={styles.side}>
        {rightAction ? (
          <TaboPressable onPress={rightAction.onPress} style={styles.iconButton}>
            <TaboIcon name={rightAction.icon} size={24} color={dark.text} />
          </TaboPressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
  },
});
