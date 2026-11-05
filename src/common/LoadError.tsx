import { Alert, Button } from '@mui/material';

// A failed load must not read as "nothing here yet"
const LoadError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    }
  >
    {message}
  </Alert>
);

export default LoadError;
