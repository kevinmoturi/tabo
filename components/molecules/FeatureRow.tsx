import { StyleSheet, View } from 'react-native';
import { TaboIcon, type IconName } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';

interface FeatureRowProps {
  icon: IconName;
  title: string;
  description: string;
}

export function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <TaboIcon name={icon} size={22} color={dark.brandOnSurf} />
      </View>
      <View style={styles.text}>
        <TaboText variant="body" color={dark.text} style={styles.title}>
          {title}
        </TaboText>
        <TaboText variant="body-sm" color={dark.text3}>
          {description}
        </TaboText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: dark.brandWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
});
