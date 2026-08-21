/**
 * Tabo — typography tokens.
 * Uses system-font fallbacks because Aharoni/Inter are not bundled yet.
 */

export const fontFamilies = {
  display: 'Aharoni, Archivo Black, Arial Black, system-ui, sans-serif',
  ui: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  mono: 'ui-monospace, SF Mono, Menlo, monospace',
} as const;

export const fontSizes = {
  display: 34,
  h1: 26,
  h2: 20,
  h3: 17,
  body: 15,
  bodySm: 13,
  label: 12,
  mono: 15,
} as const;

export const lineHeights = {
  display: 36,
  h1: 30,
  h2: 24,
  h3: 22,
  body: 23,
  bodySm: 19,
  label: 16,
  mono: 20,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;
