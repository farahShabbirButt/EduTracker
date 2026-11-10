import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, useEffect, useState } from 'react';
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from '../utils/localStorageMethods';
import createEducationTrackerTheme from './CreateTheme';

// Define Theme Context Interface
type ThemeContextType = {
  isDarkMode: boolean;
  toogleTheme: (mode: string) => void;
};

// Create Context
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    readFromLocalStorage('theme') === 'dark'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      writeToLocalStorage('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      writeToLocalStorage('theme', 'light');
    }
  }, [isDarkMode]);

  const toogleTheme = (mode: string) => {
    setIsDarkMode(mode === 'dark');
  };

  // Create MUI Theme
  const theme = createEducationTrackerTheme(isDarkMode);
  return (
    <ThemeContext value={{ isDarkMode, toogleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeContext>
  );
};
