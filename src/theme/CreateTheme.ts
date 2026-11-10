import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import {
  darkColors,
  fonts,
  lightColors,
  motion,
  radii,
  shadows,
} from './tokens';

// Builds the MUI theme from tokens.ts. No colour or size is decided here.
const createEducationTrackerTheme = (isDarkMode = false) => {
  const c = isDarkMode ? darkColors : lightColors;
  const shadow = shadows(c.shadowColor);

  const press = {
    transition: `transform ${motion.fast} ${motion.ease}, background-color ${motion.medium}, border-color ${motion.medium}, color ${motion.medium}, box-shadow ${motion.medium}`,
    '&:active': { transform: `scale(${motion.pressScale})` },
  };

  return createTheme({
    studio: { radii, motion, fonts, shadows: shadow },

    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      studio: c,
      primary: {
        main: c.primary,
        light: c.primaryBright,
        dark: c.primaryDark,
        contrastText: c.onPrimary,
      },
      secondary: {
        main: c.surfaceSoft,
        light: c.surface,
        dark: c.line,
        contrastText: c.ink,
      },
      background: {
        default: c.page,
        paper: c.surface,
        primary: c.page,
        secondary: c.surfaceSoft,
        input: c.surface,
        accent: c.tint,
      },
      text: {
        primary: c.ink,
        secondary: c.inkSoft,
        disabled: c.inkDisabled,
        hint: c.inkMuted,
      },
      divider: c.line,
      heading: { primary: c.ink, secondary: c.inkSoft, accent: c.primary },
      success: { main: c.green, light: c.greenSoft, dark: c.greenInk },
      warning: { main: c.amber, light: c.amberSoft, dark: c.amberInk },
      error: { main: c.red, light: c.redSoft, dark: c.redStrong },
      info: { main: c.blue, light: c.blueSoft, dark: c.blue },
      grade: {
        excellent: c.green,
        good: c.greenInk,
        average: c.amber,
        poor: c.amberInk,
        fail: c.red,
      },
      border: { main: c.line, light: c.surfaceSoft, focus: c.primaryBright },
      hover: { main: c.tint, secondary: c.surfaceSoft },
      icon: { default: c.inkSoft, primary: c.primary, secondary: c.inkMuted },
      DataGrid: { bg: c.surface, headerBg: c.surfaceSoft, pinnedBg: c.surface },
    },

    typography: {
      fontFamily: fonts.body,
      h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' },
      h3: { fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.01em' },
      h4: { fontWeight: 700, fontSize: '1.25rem' },
      h5: { fontWeight: 700, fontSize: '1.125rem' },
      h6: { fontWeight: 700, fontSize: '1rem' },
      body1: { fontSize: '0.95rem', lineHeight: 1.55, fontWeight: 500 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 },
      button: { fontWeight: 700, fontSize: '0.9rem', textTransform: 'none' },
      caption: { fontSize: '0.78rem', lineHeight: 1.4, fontWeight: 500 },
    },

    shape: { borderRadius: radii.base },
    spacing: 8,

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.page,
            transition: `background-color ${motion.medium}, color ${motion.medium}`,
            scrollbarColor: `${c.scrollbar} transparent`,
          },
          // Toasts follow the theme. Their own colours are set by these variables.
          '.Toastify': {
            '--toastify-color-light': c.surface,
            '--toastify-text-color-light': c.ink,
            '--toastify-font-family': fonts.body,
            '--toastify-color-success': c.green,
            '--toastify-color-error': c.red,
            '--toastify-color-warning': c.amber,
            '--toastify-color-info': c.primary,
            '--toastify-icon-color-success': c.green,
            '--toastify-icon-color-error': c.red,
            '--toastify-icon-color-warning': c.amber,
            '--toastify-icon-color-info': c.primary,
          },
          '.Toastify__toast': {
            minHeight: 56,
            padding: '12px 14px',
            border: `1px solid ${c.line}`,
            borderRadius: radii.medium,
            boxShadow: shadow.large,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4,
          },
          '.Toastify__close-button': {
            alignSelf: 'center',
            color: c.inkMuted,
            opacity: 1,
          },
          // Phones: above the bottom tabs, not on top of them
          '@media (max-width: 899.95px)': {
            '.Toastify__toast-container': {
              bottom: 'calc(96px + env(safe-area-inset-bottom)) !important',
              left: '16px !important',
              right: '16px !important',
              width: 'auto !important',
            },
          },
          // Passwords have their own show button, so Edge's second one goes
          'input::-ms-reveal': { display: 'none' },
          '@keyframes studio-rise': {
            from: { opacity: 0, transform: 'translateY(8px)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationDelay: '0ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },

      // Without the ripple, MUI draws no keyboard focus of its own
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: `2px solid ${c.primaryBright}`,
              outlineOffset: 2,
            },
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radii.pill,
            minHeight: 44,
            padding: '0 20px',
            ...press,
          },
          sizeSmall: { minHeight: 36, padding: '0 14px' },
          containedPrimary: {
            boxShadow: `0 8px 18px -10px ${c.primary}`,
            '&:hover': { backgroundColor: c.primaryBright },
          },
          containedSecondary: {
            color: c.ink,
            backgroundColor: c.surfaceSoft,
            '&:hover': { backgroundColor: c.line },
          },
          outlinedPrimary: {
            borderColor: c.line,
            color: c.ink,
            backgroundColor: c.surface,
            '&:hover': {
              borderColor: c.primaryBright,
              color: c.primary,
              backgroundColor: c.surface,
            },
          },
          textPrimary: { '&:hover': { backgroundColor: c.tint } },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: radii.medium,
            ...press,
            // A coloured button, such as a red delete, keeps its colour
            ...((ownerState.color ?? 'default') === 'default' && {
              '@media (hover: hover)': {
                '&:hover': { backgroundColor: c.tint, color: c.tintInk },
              },
            }),
          }),
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radii.large,
            boxShadow: shadow.card,
            border: `1px solid ${c.cardLine}`,
            transition: `background-color ${motion.medium}, box-shadow ${motion.medium}`,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: radii.large },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radii.medium,
            backgroundColor: c.surface,
            transition: `box-shadow ${motion.medium}`,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.inputLine },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: c.primaryBright,
            },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${c.tint}` },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: c.primaryBright,
              borderWidth: 1,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: c.red,
            },
          },
          // Browsers paint saved logins pale blue, which breaks up the field
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${c.surface} inset`,
              WebkitTextFillColor: c.ink,
              caretColor: c.ink,
              borderRadius: 'inherit',
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radii.pill, fontWeight: 700 },
          colorPrimary: { backgroundColor: c.tint, color: c.tintInk },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: radii.large, boxShadow: shadow.large },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radii.medium,
            border: `1px solid ${c.line}`,
            boxShadow: shadow.large,
            // A long list scrolls, so it can't fill a phone screen
            maxHeight: 'min(340px, 60vh)',
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: radii.small,
            backgroundColor: c.ink,
            color: c.surface,
            fontSize: '0.8rem',
          },
        },
      },

      MuiTabs: {
        styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
      },
      MuiTab: { styleOverrides: { root: { fontWeight: 700 } } },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: radii.medium },
          standardError: {
            backgroundColor: c.redSoft,
            color: c.red,
            '& .MuiAlert-icon': { color: c.red },
          },
          standardWarning: {
            backgroundColor: c.amberSoft,
            color: c.amberInk,
            '& .MuiAlert-icon': { color: c.amberInk },
          },
          standardSuccess: {
            backgroundColor: c.greenSoft,
            color: c.greenInk,
            '& .MuiAlert-icon': { color: c.greenInk },
          },
          standardInfo: {
            backgroundColor: c.tint,
            color: c.tintInk,
            '& .MuiAlert-icon': { color: c.tintInk },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.line },
          head: {
            color: c.inkSoft,
            fontWeight: 700,
            fontSize: '0.8rem',
            backgroundColor: c.surfaceSoft,
            borderBottom: 0,
            '&:first-of-type': {
              borderTopLeftRadius: radii.small,
              borderBottomLeftRadius: radii.small,
            },
            '&:last-of-type': {
              borderTopRightRadius: radii.small,
              borderBottomRightRadius: radii.small,
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background-color ${motion.medium}`,
            '&:last-of-type td': { borderBottom: 0 },
            'tbody &:hover': { backgroundColor: c.surfaceSoft },
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 800, fontSize: '1.2rem', paddingTop: 24 },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '14px 24px', borderTop: `1px solid ${c.line}` },
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 0,
            // Doubled up to beat the variables the grid sets on itself
            '&.MuiDataGrid-root': {
              '--DataGrid-t-color-border-base': c.line,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: c.inkSoft,
              fontWeight: 700,
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: c.surfaceSoft },
          },
        },
      },
    },
  });
};

export default createEducationTrackerTheme;
