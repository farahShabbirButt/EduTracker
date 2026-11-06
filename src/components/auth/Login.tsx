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
import PasswordTextField from '../../common/Form/PasswordTextField';
import { useDispatch, useSelector } from 'react-redux';
import { routes } from '../../config/routes';
import type { AppDispatch, RootState } from '../../redux/store';
import { login, clearAuthError } from '../../redux/slices/authSlice';

export default function LoginForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });

  const dispatch = useDispatch<AppDispatch>();
  const { signingIn, error } = useSelector((state: RootState) => state.auth);

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
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to enter marks and print result cards.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          fullWidth
          required
          value={values.email}
          onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
        />
        <PasswordTextField
          label="Password"
          type="password"
          autoComplete="current-password"
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
          disabled={signingIn}
        >
          {signingIn ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
