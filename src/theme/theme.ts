import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';
import type { ColorTokens } from './tokens';

// Extend the default MUI Palette types to include standalone colors
interface TypeBorder {
  main: string;
  light: string;
  focus: string;
}
interface TypeHover {
  main: string;
  secondary: string;
}
interface TypeIcon {
  default: string;
  primary: string;
  secondary: string;
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    input?: string;
    secondary?: string;
    primary: string;
    accent: string;
  }

  interface TypeText {
    hint: string;
  }

  interface TypeHeading {
    primary: string;
    secondary: string;
    accent: string;
  }

  interface TypeGrade {
    excellent: string;
    good: string;
    average: string;
    poor: string;
    fail: string;
  }
  interface Palette {
    alert: PaletteColor;
    border: TypeBorder;
    icon: TypeIcon;
    placeholder: PaletteColor;
    hover: TypeHover;
    heading: TypeHeading;
    grade: TypeGrade;
    studio: ColorTokens;
  }

  interface PaletteOptions {
    alert?: PaletteColorOptions;
    border?: Partial<TypeBorder>;
    hover?: Partial<TypeHover>;
    icon?: Partial<TypeIcon>;
    placeholder?: PaletteColorOptions;
    heading?: Partial<TypeHeading>;
    grade?: Partial<TypeGrade>;
    studio?: ColorTokens;
  }

  interface Theme {
    studio: {
      radii: typeof import('./tokens').radii;
      motion: typeof import('./tokens').motion;
      fonts: typeof import('./tokens').fonts;
      shadows: ReturnType<typeof import('./tokens').shadows>;
    };
  }

  interface ThemeOptions {
    studio?: Theme['studio'];
  }
}
