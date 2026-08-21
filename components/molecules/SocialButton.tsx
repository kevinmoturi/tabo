import { Pressable, StyleSheet } from 'react-native';
import { TaboIcon, type IconName } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
}

const providerConfig: Record<
  SocialButtonProps['provider'],
  { label: string; icon: IconName }
> = {
  google: { label: 'Continue with Google', icon: 'Globe' },
  apple: { label: 'Continue with Apple', icon: 'Apple' },
};

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const { label, icon } = providerConfig[provider];

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <TaboIcon name={icon} size={20} color={dark.text} />
      <TaboText variant="body" color={dark.text} style={styles.text}>
        {label}
      </TaboText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dark.surface,
    borderWidth: 1,
    borderColor: dark.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  text: {
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});
