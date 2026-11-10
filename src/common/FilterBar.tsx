import type { ReactNode } from 'react';
import { Card, Stack } from '@mui/material';

// The white strip of filters and actions at the top of a screen
export default function FilterBar({ children }: { children: ReactNode }) {
  return (
    <Card sx={{ px: 2, py: 1.75 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: { sm: 'flex-end' } }}
      >
        {children}
      </Stack>
    </Card>
  );
}
