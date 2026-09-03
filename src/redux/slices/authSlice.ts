import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { AUTH_ROUTES } from '../../services/apiRoutes';
import type {
  IAuthUser,
  ILoginPayload,
  IResetPasswordPayload,
} from '../../@types/auth.d';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: IAuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

// Surfaces the backend's wording rather than inventing our own.
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export const login = createAsyncThunk(
  'auth/login',
  async (payload: ILoginPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(AUTH_ROUTES.LOGIN, payload);
      return response?.[response?.keyName]?.user as IAuthUser;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to log in'));
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any>(AUTH_ROUTES.ME);
      return response?.[response?.keyName] as IAuthUser;
    } catch (error) {
      // A 401 here is the normal "not logged in" case, not an error worth showing.
      return rejectWithValue(messageFrom(error, 'Not authenticated'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Deliberately not rethrowing: if the call fails the local session is cleared
  // anyway, so the user is never stuck appearing logged in.
  await apiClient.post<any>(AUTH_ROUTES.LOGOUT, {}).catch(() => undefined);
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(AUTH_ROUTES.FORGOT_PASSWORD, {
        email,
      });
      return (
        (response?.message as string) ||
        'If an account exists, a reset link has been sent'
      );
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to request a password reset')
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: IResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(
        AUTH_ROUTES.RESET_PASSWORD,
        payload
      );
      return (response?.message as string) || 'Password has been reset';
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to reset password'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dispatched by the apiClient 401 hook when a token expires mid-session.
    sessionExpired: (state) => {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.user = null;
        state.error = (action.payload as string) || 'Failed to log in';
      })

      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        // No error surfaced: "not logged in" is an expected outcome on first load.
        state.status = 'unauthenticated';
        state.user = null;
      })

      .addCase(logout.fulfilled, (state) => {
        state.status = 'unauthenticated';
        state.user = null;
        state.error = null;
      })

      .addCase(forgotPassword.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to request a password reset';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to reset password';
      });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
