import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { ThemeContext } from '../theme/ThemeContextProvider';

export default function ThemeToggle() {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.isDarkMode ?? false;
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => themeContext?.toogleTheme(isDark ? 'light' : 'dark')}
        sx={{ color: 'text.secondary' }}
      >
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
