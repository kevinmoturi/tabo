import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { TaboText } from './TaboText';
import { dark, radii, spacing } from '../../src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'alert';

interface TaboButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: dark.brand },
  secondary: { backgroundColor: dark.surface2 },
  ghost: { backgroundColor: 'transparent' },
  alert: { backgroundColor: dark.alertBtn },
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: dark.onBrand,
  secondary: dark.text,
  ghost: dark.brandOnSurf,
  alert: dark.onBrand,
};

export function TaboButton({
  children,
  variant = 'primary',
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...rest
}: TaboButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => {
        const incoming = typeof style === 'function'
          ? style({ pressed })
          : style;
        const flattened = StyleSheet.flatten(incoming) ?? {};

        return {
          ...styles.base,
          ...variantContainerStyles[variant],
          ...(fullWidth ? styles.fullWidth : {}),
          ...(disabled ? styles.disabled : {}),
          ...(pressed ? styles.pressed : {}),
          ...flattened,
        };
      }}
      disabled={disabled}
      {...rest}>
      {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
      <TaboText
        variant="body"
        color={variantTextColors[variant]}
        style={styles.text}>
        {children}
      </TaboText>
      {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
