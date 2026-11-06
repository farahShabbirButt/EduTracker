import type { ReactNode } from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';

// Forms open in a side panel, or a bottom sheet on phones. Only the panel's own
// buttons close one, so a stray click or key can't lose a half-filled form.
export default function FormPanel({
  open,
  label,
  children,
}: {
  open: boolean;
  label: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Drawer
      anchor={phone ? 'bottom' : 'right'}
      open={open}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': label,
          'aria-modal': true,
          sx: {
            width: { xs: '100%', md: 480 },
            maxWidth: '100%',
            maxHeight: { xs: '92dvh', md: '100%' },
            borderRadius: {
              xs: `${theme.studio.radii.large}px ${theme.studio.radii.large}px 0 0`,
              md: `${theme.studio.radii.large}px 0 0 ${theme.studio.radii.large}px`,
            },
            '& > form': {
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              flex: 1,
            },
          },
        },
      }}
    >
      {children}
    </Drawer>
  );
}
