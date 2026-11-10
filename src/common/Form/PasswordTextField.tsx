import { useState } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  type TextFieldProps,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

// A password field with a button to show what was typed
export default function PasswordTextField({
  slotProps,
  ...props
}: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Hide password' : 'Show password';

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...(slotProps?.input as object),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={label}>
                <IconButton
                  edge="end"
                  aria-label={label}
                  onClick={() => setVisible((was) => !was)}
                >
                  {visible ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                  ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
