import { StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboIcon, type IconName } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

interface PermissionPromptProps {
  type: 'location' | 'notification' | 'camera';
  onGrant: () => void;
  onSkip?: () => void;
}

const config: Record<
  PermissionPromptProps['type'],
  { icon: IconName; title: string; body: string }
> = {
  location: {
    icon: 'MapPin',
    title: 'Location access',
    body: 'Tabo records your device location at unlock so you know where it was accessed. Choose "Allow all the time" for protection while the app is closed.',
  },
  notification: {
    icon: 'Bell',
    title: 'Push notifications',
    body: 'Get alerted immediately when an intruder is detected.',
  },
  camera: {
    icon: 'Camera',
    title: 'Camera access',
    body: 'Capture evidence when an alert is triggered.',
  },
};

export function PermissionPrompt({
  type,
  onGrant,
  onSkip,
}: PermissionPromptProps) {
  const { icon, title, body } = config[type];

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <TaboIcon name={icon} size={32} color={dark.brandOnSurf} />
      </View>
      <TaboText variant="h2" color={dark.text} align="center" style={styles.title}>
        {title}
      </TaboText>
      <TaboText variant="body" color={dark.text2} align="center" style={styles.body}>
        {body}
      </TaboText>
      <TaboButton onPress={onGrant}>Grant access</TaboButton>
      {onSkip ? (
        <TaboButton variant="ghost" onPress={onSkip}>
          Not now
        </TaboButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: dark.border,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: dark.brandWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    width: '100%',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    width: '100%',
    marginBottom: spacing.xl,
  },
});
