import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { dark, fontSizes, fontWeights, lineHeights } from '../../src/theme';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'body-sm'
  | 'label'
  | 'mono';

interface TaboTextProps extends TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontWeight: fontWeights.black as TextStyle['fontWeight'],
  },
  h1: {
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    fontWeight: fontWeights.black as TextStyle['fontWeight'],
  },
  h2: {
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    fontWeight: fontWeights.bold as TextStyle['fontWeight'],
  },
  h3: {
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
    fontWeight: fontWeights.bold as TextStyle['fontWeight'],
  },
  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular as TextStyle['fontWeight'],
  },
  'body-sm': {
    fontSize: fontSizes.bodySm,
    lineHeight: lineHeights.bodySm,
    fontWeight: fontWeights.regular as TextStyle['fontWeight'],
  },
  label: {
    fontSize: fontSizes.label,
    lineHeight: lineHeights.label,
    fontWeight: fontWeights.medium as TextStyle['fontWeight'],
    letterSpacing: 0.3,
  },
  mono: {
    fontSize: fontSizes.mono,
    lineHeight: lineHeights.mono,
    fontWeight: fontWeights.regular as TextStyle['fontWeight'],
    fontFamily: 'monospace',
  },
};

export function TaboText({
  children,
  variant = 'body',
  color = dark.text,
  align,
  style,
  ...rest
}: TaboTextProps) {
  return (
    <Text
      style={[
        styles.base,
        variantStyles[variant],
        { color },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: dark.text,
  },
});
