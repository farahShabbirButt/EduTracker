// The one place for how the app looks. Change a value here and every screen follows.
// CreateTheme.ts builds the MUI theme from this file, and screens read the theme.

export const lightColors = {
  page: '#F6F5FB',
  surface: '#FFFFFF',
  surfaceSoft: '#F3F2FA',
  line: '#E6E4F4',
  ink: '#14142B',
  inkSoft: '#46465F',
  inkMuted: '#63637E',
  inkDisabled: '#9A9AB0',
  inputLine: '#8F8DAE',
  primary: '#4338CA',
  primaryBright: '#4F46E5',
  primaryDark: '#3730A3',
  onPrimary: '#FFFFFF',
  tint: '#ECEBFE',
  tintInk: '#3730A3',
  amber: '#E39A2D',
  amberSoft: '#FDF1DC',
  amberInk: '#8A4B06',
  red: '#C2272D',
  redStrong: '#A01F25',
  redSoft: '#FDE9E9',
  green: '#0F7A55',
  greenSoft: '#DDF3EA',
  greenInk: '#0B5C40',
  blue: '#2F6FD0',
  blueSoft: '#E2ECFB',
  peach: '#FCE8DF',
  mint: '#DFF3EA',
  sky: '#E2ECFB',
  sidebar: '#1E1A63',
  sidebarInk: '#CFCCF5',
  sidebarInkStrong: '#FFFFFF',
  sidebarLine: 'rgba(255, 255, 255, 0.12)',
  sidebarHover: 'rgba(255, 255, 255, 0.08)',
  pill: '#FFFFFF',
  pillInk: '#2E2A9C',
  hero: '#4338CA',
  // Printed paper stays white in every theme
  paper: '#FFFFFF',
  paperInk: '#000000',
  paperLine: '#DDDDEE',
  paperAccent: '#4338CA',
  stamp: '#0F7A55',
  scrollbar: '#C9C7DE',
  shadowColor: '30, 26, 99',
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  ...lightColors,
  page: '#100F24',
  surface: '#1A1934',
  surfaceSoft: '#232242',
  line: '#2F2D55',
  ink: '#F3F2FC',
  inkSoft: '#C4C3DC',
  inkMuted: '#A09FBD',
  inkDisabled: '#6F6E8E',
  inputLine: '#6D6BA3',
  primary: '#8D88F7',
  primaryBright: '#A5A1FA',
  primaryDark: '#736EEA',
  onPrimary: '#14123D',
  tint: '#2C2A5E',
  tintInk: '#CDCBFF',
  amberSoft: '#3C2C14',
  amberInk: '#F6CC8A',
  red: '#FF9A9A',
  redStrong: '#FFB8B8',
  redSoft: '#43202A',
  green: '#5FD6AC',
  greenSoft: '#15392E',
  greenInk: '#9BE8CC',
  blue: '#8DB7F5',
  blueSoft: '#1E2C47',
  peach: '#3B2A2C',
  mint: '#18372F',
  sky: '#1E2C47',
  sidebar: '#1A1838',
  pill: '#8D88F7',
  pillInk: '#14123D',
  hero: '#332DA8',
  scrollbar: '#3A3863',
  shadowColor: '0, 0, 0',
};

// The result card. It stays the same in every theme, and these stay legible
// when the school's black-and-white printer turns them to grey.
export const cardColors = {
  paper: '#FFFFFF',
  ink: '#14142B',
  accent: '#4338CA',
  label: '#3730A3',
  onLabel: '#FFFFFF',
  tint: '#ECEBFE',
  stripe: '#F6F5FB',
  block: '#C9C6F7',
  line: '#2A2760',
  rule: 'rgba(20, 20, 43, 0.3)',
};

export const fonts = {
  body: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
  display: '"Fraunces", Georgia, serif',
};

// base is MUI's unit: `borderRadius: 2` in sx means twice this
export const radii = {
  base: 8,
  small: 10,
  medium: 14,
  large: 20,
  xlarge: 28,
  pill: 999,
};

export const motion = {
  ease: 'cubic-bezier(.22, .8, .3, 1)',
  spring: 'cubic-bezier(.34, 1.32, .5, 1)',
  fast: '.14s',
  medium: '.26s',
  slow: '.42s',
  pressScale: 0.96,
};

export const shadows = (rgb: string) => ({
  small: `0 1px 2px rgba(${rgb}, .05)`,
  medium: `0 10px 28px -14px rgba(${rgb}, .24)`,
  large: `0 28px 70px -24px rgba(${rgb}, .42)`,
});
