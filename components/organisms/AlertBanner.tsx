import { StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, semantic, spacing } from '../../src/theme';

interface AlertBannerProps {
  title?: string;
  body?: string;
  onView?: () => void;
  onDismiss?: () => void;
}

export function AlertBanner({
  title = 'Intruder detected',
  body = 'An unauthorised unlock was detected at your device. Review the event now.',
  onView,
  onDismiss,
}: AlertBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <TaboIcon name="ShieldAlert" size={28} color={semantic.alert} />
        </View>
        <TaboText variant="h2" color={dark.alertFg} style={styles.title}>
          {title}
        </TaboText>
      </View>
      <TaboText variant="body" color={dark.text2} style={styles.body}>
        {body}
      </TaboText>
      <View style={styles.actions}>
        <TaboButton variant="alert" onPress={onView}>
          Review event
        </TaboButton>
        {onDismiss ? (
          <>
            <View style={styles.spacer} />
            <TaboButton variant="secondary" onPress={onDismiss}>
              Dismiss
            </TaboButton>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: dark.alertWash,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: semantic.alert,
    padding: spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: semantic.alert,
    opacity: 0.14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
  },
  body: {
    marginBottom: spacing.lg,
  },
  actions: {},
  spacer: {
    height: spacing.sm,
  },
});
