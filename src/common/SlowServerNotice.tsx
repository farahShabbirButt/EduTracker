import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { apiClient } from '../services/apiClient';

// Shown while the server takes more than a few seconds to answer. On the free host the server
// sleeps after about 15 idle minutes, so the first request after a break waits while it starts.
export default function SlowServerNotice() {
  const [slow, setSlow] = useState(false);
  useEffect(() => apiClient.onSlowChange(setSlow), []);

  return (
    <Snackbar
      open={slow}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="info" variant="filled" sx={{ alignItems: 'center' }}>
        Still waiting for the server. If EduTracker hasn't been used for a
        while, it can take up to a minute to start.
      </Alert>
    </Snackbar>
  );
}
