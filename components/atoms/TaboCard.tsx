import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { dark, radii, spacing } from '../../src/theme';

interface TaboCardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
}

export function TaboCard({ children, padded = true, style, ...rest }: TaboCardProps) {
  return (
    <View
      style={[styles.card, padded && styles.padded, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: dark.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
