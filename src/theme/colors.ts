/**
 * Tabo — colour tokens (dark-first, sampled from the lens photo).
 * Mirrors assets/brand/tokens.css.
 */

export const brand = {
  blue: '#2B37FF',
  blueBright: '#4C5BFF',
  blueText: '#93A0FF',
  blueDeep: '#010767',
  violet: '#7C6BD6',
  mist: '#92C5D8',
  mistSoft: '#C1DDE9',
  ink: '#06070A',
} as const;

export const semantic = {
  ok: '#22C58B',
  warn: '#F2A83B',
  alert: '#FF4256',
} as const;

export const dark = {
  bg: '#07080C',
  surface: '#10131C',
  surface2: '#181C28',
  surface3: '#212636',
  border: '#262C3B',
  borderStrong: '#38405A',

  text: '#F3F5FB',
  text2: '#A2AAC0',
  text3: '#8A93A8',

  okFg: semantic.ok,
  warnFg: semantic.warn,
  alertFg: semantic.alert,
  alertBtn: semantic.alert,
  mistFg: brand.mist,

  brand: brand.blue,
  brandHover: brand.blueBright,
  onBrand: '#FFFFFF',
  brandOnSurf: brand.blueText,

  alertWash: 'rgba(255, 66, 86, 0.14)',
  okWash: 'rgba(34, 197, 139, 0.14)',
  brandWash: 'rgba(43, 55, 255, 0.16)',
  mistWash: 'rgba(146, 197, 216, 0.12)',
  warnWash: 'rgba(242, 168, 59, 0.14)',

  mapBg: '#0B0F17',
  mapBlock: '#111725',
  mapRoad: '#232C3E',
  mapRoad2: '#1B2231',
  mapHiway: '#2E3950',
  mapLabel: '#3B4557',

  scrim: 'rgba(4, 5, 8, 0.72)',
} as const;

export const light = {
  bg: '#FFFFFF',
  surface: '#F4F6FB',
  surface2: '#EAEEF7',
  surface3: '#DFE5F1',
  border: '#DCE2EE',
  borderStrong: '#B9C2D6',

  text: '#0A0C13',
  text2: '#4C5570',
  text3: '#5C6580',

  okFg: '#0B7A50',
  warnFg: '#8A5605',
  alertFg: '#C40F2B',
  alertBtn: '#C40F2B',
  mistFg: '#2F6B85',

  brand: '#1D28D6',
  brandHover: brand.blue,
  onBrand: '#FFFFFF',
  brandOnSurf: '#1B25C4',

  alertWash: 'rgba(255, 66, 86, 0.10)',
  okWash: 'rgba(34, 197, 139, 0.12)',
  brandWash: 'rgba(43, 55, 255, 0.08)',
  mistWash: 'rgba(78, 143, 168, 0.10)',
  warnWash: 'rgba(242, 168, 59, 0.10)',

  scrim: 'rgba(10, 12, 19, 0.45)',
} as const;

export type BrandColors = keyof typeof brand;
export type SemanticColors = keyof typeof semantic;
export type DarkColors = keyof typeof dark;
export type LightColors = keyof typeof light;
