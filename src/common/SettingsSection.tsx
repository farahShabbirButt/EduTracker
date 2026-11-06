import type { BaseSyntheticEvent, ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  // Usually the save button, at the end of the fields
  action?: ReactNode;
  // Makes the section its own form. Leave out if it's part of a larger form.
  onSubmit?: (event?: BaseSyntheticEvent) => void;
};

// One group of settings: what it is on the left, its fields on the right, and
// stacked on a phone. Fields sit two to a row; use gridColumn '1 / -1' to span
// both, or gridColumnStart 1 to begin a new row.
export default function SettingsSection({
  title,
  description,
  children,
  action,
  onSubmit,
}: SettingsSectionProps) {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(200px, 1fr) minmax(0, 2.6fr)',
          },
          gap: { xs: 2.5, md: 5 },
          p: { xs: 2.5, md: 3.5 },
          '&:last-child': { pb: { xs: 2.5, md: 3.5 } },
        }}
      >
        <div>
          <Typography variant="h5">{title}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: '34ch' }}
          >
            {description}
          </Typography>
        </div>
        <Box
          {...(onSubmit
            ? { component: 'form' as const, noValidate: true, onSubmit }
            : {})}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {children}
          </Box>
          {action && (
            <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2.5 }}>
              {action}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
