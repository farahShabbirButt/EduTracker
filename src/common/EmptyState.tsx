import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = ({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) => (
  <Box
    sx={{
      display: 'grid',
      justifyItems: 'center',
      gap: 1,
      py: 5,
      px: 2,
      textAlign: 'center',
    }}
  >
    <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
    {detail && <Typography variant="body2">{detail}</Typography>}
    {action}
  </Box>
);

export default EmptyState;
