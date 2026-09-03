import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { routes } from '../../config/routes';
import type { AppDispatch, RootState } from '../../redux/store';
import { login, clearAuthError } from '../../redux/slices/authSlice';

export default function LoginForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });

  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const submitting = status === 'loading';

  // Clear a stale error when the screen mounts, so a previous failure does not
  // greet the user on their next visit.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      navigate(routes.portal.dashboard);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5, color: 'heading.primary' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your admin account
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={values.email}
          onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={values.password}
          onChange={(e) =>
            setValues((s) => ({ ...s, password: e.target.value }))
          }
        />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box />
          <Link
            component={RouterLink}
            to={routes.auth.forgetPassword}
            underline="hover"
            color="primary.main"
          >
            Forgot password?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
