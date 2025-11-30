import { createTheme } from '@mui/material/styles';

// Education Tracker Theme Configuration
const createEducationTrackerTheme = (isDarkMode = false) => {
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',

      // Primary color scheme - Purple tone for education
      primary: {
        main: '#822cd3', // Purple primary
        light: '#a855f7', // Lighter purple
        dark: '#6b21a8', // Darker purple
        contrastText: '#ffffff',
      },

      // Secondary color - Complementary accent
      secondary: {
        main: '#f5f5f5', // Light gray
        light: '#fafafa', // Very light gray
        dark: '#e0e0e0', // Medium gray
        contrastText: '#822cd3',
      },

      // Background colors
      background: {
        default: isDarkMode ? '#121212' : '#ffffff',
        paper: isDarkMode ? '#2f2f2f' : '#ffffff',
        primary: isDarkMode ? '#1e1e1e' : '#f7f7f7', // Light background areas
        secondary: isDarkMode ? '#2d2d2d' : '#f5f5f5', // Card backgrounds
        input: isDarkMode ? '#2d2d2d' : '#ffffff',
        accent: isDarkMode ? '#3a2f44' : '#f3e8ff', // Light purple accent
      },

      // Text colors
      text: {
        primary: isDarkMode ? '#ffffff' : '#2c3e50',
        secondary: isDarkMode ? '#b0b0b0' : '#5a6c7d',
        disabled: isDarkMode ? '#666666' : '#9e9e9e',
        hint: isDarkMode ? '#888888' : '#757575',
      },

      // Heading colors
      heading: {
        primary: isDarkMode ? '#ffffff' : '#1a202c',
        secondary: isDarkMode ? '#e2e8f0' : '#2d3748',
        accent: '#822cd3',
      },

      // Status colors for education tracking
      success: {
        main: '#4caf50', // Green for completed tasks
        light: '#81c784',
        dark: '#388e3c',
      },

      warning: {
        main: '#ff9800', // Orange for pending items
        light: '#ffb74d',
        dark: '#f57c00',
      },

      error: {
        main: '#f44336', // Red for overdue/failed
        light: '#e57373',
        dark: '#d32f2f',
      },

      info: {
        main: '#8b5cf6', // Purple info color
        light: '#a78bfa',
        dark: '#7c3aed',
      },

      // Custom colors for education features
      grade: {
        excellent: '#4caf50', // A grades
        good: '#8bc34a', // B grades
        average: '#ffc107', // C grades
        poor: '#ff5722', // D grades
        fail: '#f44336', // F grades
      },

      // UI element colors
      border: {
        main: isDarkMode ? '#404040' : '#e0e0e0',
        light: isDarkMode ? '#333333' : '#f0f0f0',
        focus: '#822cd3',
      },

      hover: {
        main: isDarkMode ? '#5b3480' : '#f3e8ff',
        secondary: isDarkMode ? '#333333' : '#f5f5f5',
      },

      icon: {
        default: isDarkMode ? '#b0b0b0' : '#5a6c7d',
        primary: '#822cd3',
        secondary: isDarkMode ? '#888888' : '#757575',
      },
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

      // Heading styles
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },

      // Body text
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },

      // Button text
      button: {
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'none',
        letterSpacing: '0.02em',
      },

      // Caption and overline
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 400,
      },
      overline: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },

    shape: {
      borderRadius: 8,
    },

    spacing: 8,

    components: {
      // Global styles
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDarkMode ? '#404040 #2d2d2d' : '#c1c1c1 #f1f1f1',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDarkMode ? '#404040' : '#c1c1c1',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: isDarkMode ? '#2d2d2d' : '#f1f1f1',
            },
          },
        },
      },

      // Button styles
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(130, 44, 211, 0.2)',
            },
          },
          containedPrimary: {
            backgroundColor: '#822cd3',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#6b21a8',
            },
          },
          containedSecondary: {
            backgroundColor: '#f3f4f6',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#e5e7eb',
            },
          },

          outlinedPrimary: {
            borderColor: '#822cd3',
            color: '#822cd3',
            '&:hover': {
              backgroundColor: '#f3e8ff',
              borderColor: '#822cd3',
            },
          },
          textPrimary: {
            color: '#822cd3',
            '&:hover': {
              backgroundColor: '#f3e8ff',
            },
          },
        },
      },

      // Card styles
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode
              ? '0 2px 12px rgba(0, 0, 0, 0.3)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid #333333' : '1px solid #f0f0f0',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 20px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },

      // Input field styles
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#822cd3',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#822cd3',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? '#b0b0b0' : '#5a6c7d',
              '&.Mui-focused': {
                color: '#822cd3',
              },
            },
          },
        },
      },

      // Chip styles (for tags, grades, etc.)
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: '#f3e8ff',
            color: '#822cd3',
            '&:hover': {
              backgroundColor: '#e9d5ff',
            },
          },
        },
      },

      // Paper styles
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 8,
          },
        },
      },

      // Typography overrides
      MuiTypography: {
        styleOverrides: {
          root: {
            wordBreak: 'break-word',
          },
          h1: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
          h2: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
          h3: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
          h4: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
          h5: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
          h6: {
            color: isDarkMode ? '#ffffff' : '#1a202c',
          },
        },
      },
    },
  });

  return theme;
};

// Usage example:
// const theme = createEducationTrackerTheme(false); // Light mode
// const darkTheme = createEducationTrackerTheme(true); // Dark mode

export default createEducationTrackerTheme;
