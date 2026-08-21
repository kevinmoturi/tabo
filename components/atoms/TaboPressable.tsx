import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';
import { dark, radii } from '../../src/theme';

interface TaboPressableProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  ripple?: boolean;
  pressedOpacity?: number;
}

export function TaboPressable({
  children,
  ripple,
  pressedOpacity = 0.7,
  style,
  android_ripple,
  ...rest
}: TaboPressableProps) {
  return (
    <Pressable
      android_ripple={
        ripple
          ? { color: dark.brandWash, foreground: true, ...android_ripple }
          : undefined
      }
      style={({ pressed }) => {
        const incoming = typeof style === 'function'
          ? style({ pressed })
          : style;
        const flattened = StyleSheet.flatten(incoming) ?? {};

        return {
          ...styles.base,
          opacity: pressed ? pressedOpacity : 1,
          ...flattened,
        };
      }}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
  },
});
