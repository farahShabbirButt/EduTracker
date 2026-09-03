import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { routes } from '../../config/routes';
import type { AppDispatch } from '../../redux/store';
import { forgotPassword } from '../../redux/slices/authSlice';

export default function ForgotPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await dispatch(forgotPassword(email));
    setSubmitting(false);
    // Shown regardless of outcome. The backend deliberately returns the same
    // response for known and unknown emails; branching here on success vs.
    // failure would leak whether an account exists for that address.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">
          If an account exists for that email, a password reset link has been
          sent. The link expires in one hour.
        </Alert>
        <Link
          component={RouterLink}
          to={routes.auth.login}
          underline="hover"
          alignSelf="center"
        >
          Back to login
        </Link>
      </Stack>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5, color: 'heading.primary' }}>
            Forgot password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email to receive a reset link
          </Typography>
        </Box>

        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>

        <Link
          component={RouterLink}
          to={routes.auth.login}
          underline="hover"
          alignSelf="center"
        >
          Back to login
        </Link>
      </Stack>
    </Box>
  );
}
