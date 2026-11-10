import { useId, type ReactNode } from 'react';
import { Box, TextField, Typography } from '@mui/material';

// The filters above a screen: the label sits above the box and never moves, so
// a row of them lines up with the buttons beside it.
export default function LabeledSelect({
  label,
  placeholder,
  value,
  disabled,
  minWidth = 180,
  fill = false,
  onChange,
  options,
  children,
}: {
  label: string;
  placeholder?: string;
  value: string | number;
  disabled?: boolean;
  minWidth?: number;
  // Take all the room in a column, rather than sit at its own width
  fill?: boolean;
  onChange: (value: string) => void;
  // What the box shows for each value
  options?: Record<string, string>;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <Box sx={{ minWidth, flex: { xs: 1, sm: fill ? 1 : 'none' } }}>
      <Typography
        component="label"
        htmlFor={id}
        id={`${id}-label`}
        variant="body2"
        sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}
      >
        {label}
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          select: {
            displayEmpty: true,
            labelId: `${id}-label`,
            renderValue: (selected) => {
              if (selected === '' && placeholder) return placeholder;
              if (options)
                return options[String(selected)] ?? placeholder ?? '';
              return String(selected);
            },
          },
        }}
        sx={{
          '& .MuiSelect-select': {
            minHeight: 26,
            py: '9px',
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {children}
      </TextField>
    </Box>
  );
}
