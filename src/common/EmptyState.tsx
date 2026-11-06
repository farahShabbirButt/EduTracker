import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = ({
  title,
  detail,
  icon,
  action,
}: {
  title: string;
  detail?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) => (
  <Box
    sx={{
      display: 'grid',
      justifyItems: 'center',
      gap: 1,
      py: icon ? 8 : 5,
      px: 2,
      textAlign: 'center',
    }}
  >
    {icon && (
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          width: 64,
          height: 64,
          mb: 1,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: 'background.accent',
          color: theme.palette.studio.tintInk,
          '& svg': { fontSize: 30 },
        })}
      >
        {icon}
      </Box>
    )}
    <Typography sx={{ fontWeight: 700, fontSize: icon ? 18 : undefined }}>
      {title}
    </Typography>
    {detail && (
      <Typography variant="body2" sx={{ maxWidth: '46ch' }}>
        {detail}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
