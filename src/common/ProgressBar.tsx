import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

// Grows from empty the first time it's shown
const ProgressBar = ({ value, label }: { value: number; label: string }) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      sx={(theme) => ({
        height: 8,
        overflow: 'hidden',
        bgcolor: 'background.secondary',
        borderRadius: `${theme.studio.radii.pill}px`,
      })}
    >
      <Box
        sx={(theme) => ({
          height: '100%',
          borderRadius: 'inherit',
          bgcolor: value < 100 ? 'warning.main' : 'primary.main',
          transition: `width .7s ${theme.studio.motion.ease}, background-color ${theme.studio.motion.medium}`,
        })}
        style={{ width: `${shown}%` }}
      />
    </Box>
  );
};

export default ProgressBar;
