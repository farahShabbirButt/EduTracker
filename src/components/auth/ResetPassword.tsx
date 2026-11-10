import { useState } from 'react';
import { Box, Button, Typography, Stack, Link, Alert } from '@mui/material';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import PasswordTextField from '../../common/Form/PasswordTextField';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { routes } from '../../config/routes';
import type { AppDispatch } from '../../redux/store';
import { resetPassword } from '../../redux/slices/authSlice';

export default function ResetPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [values, setValues] = useState({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mirrors the backend's 8-character minimum for a faster message; the
    // backend remains the enforcing authority.
    if (values.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (values.password !== values.confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      resetPassword({ token, newPassword: values.password })
    );
    setSubmitting(false);

    if (resetPassword.fulfilled.match(result)) {
      toast.success(result.payload as string);
      navigate(routes.auth.login);
    } else {
      setError((result.payload as string) || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <Alert severity="error">
        This reset link is missing its token. Request a new link from the
        “Forgot password” screen.
      </Alert>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            component="h1"
            sx={(theme) => ({
              mb: 0.5,
              fontFamily: theme.studio.fonts.display,
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1.15,
            })}
          >
            Set a new password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a new password for your account.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <PasswordTextField
          label="New password"
          type="password"
          autoComplete="new-password"
          fullWidth
          required
          value={values.password}
          onChange={(e) =>
            setValues((s) => ({ ...s, password: e.target.value }))
          }
        />
        <PasswordTextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          fullWidth
          required
          value={values.confirm}
          onChange={(e) =>
            setValues((s) => ({ ...s, confirm: e.target.value }))
          }
          error={Boolean(values.confirm) && values.confirm !== values.password}
          helperText={
            Boolean(values.confirm) && values.confirm !== values.password
              ? 'Passwords do not match'
              : ' '
          }
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save new password'}
        </Button>

        <Link
          component={RouterLink}
          to={routes.auth.login}
          underline="hover"
          alignSelf="center"
        >
          Back to sign in
        </Link>
      </Stack>
    </Box>
  );
}
