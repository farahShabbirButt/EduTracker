import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { AUTH_ROUTES } from '../../services/apiRoutes';
import type {
  IAuthUser,
  IChangePasswordPayload,
  ILoginPayload,
  IResetPasswordPayload,
  IUpdateProfilePayload,
} from '../../@types/auth.d';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: IAuthUser | null;
  status: AuthStatus;
  // Separate from status: App swaps the whole screen for a spinner while that is
  // 'loading', which would wipe the login form.
  signingIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  signingIn: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: ILoginPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<
        ApiResponse<'auth', { user: IAuthUser }>
      >(AUTH_ROUTES.LOGIN, payload);
      return response[response.keyName].user;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to log in'));
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<'user', IAuthUser>>(
        AUTH_ROUTES.ME
      );
      return response[response.keyName];
    } catch (error) {
      // A 401 here is the normal "not logged in" case, not an error worth showing.
      return rejectWithValue(messageFrom(error, 'Not authenticated'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Deliberately not rethrowing: if the call fails the local session is cleared
  // anyway, so the user is never stuck appearing logged in.
  await apiClient
    .post<ApiMessage>(AUTH_ROUTES.LOGOUT, {})
    .catch(() => undefined);
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiMessage>(
        AUTH_ROUTES.FORGOT_PASSWORD,
        {
          email,
        }
      );
      return (
        response.message || 'If an account exists, a reset link has been sent'
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
      const response = await apiClient.post<ApiMessage>(
        AUTH_ROUTES.RESET_PASSWORD,
        payload
      );
      return response.message || 'Password has been reset';
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to reset password'));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: IUpdateProfilePayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<'user', IAuthUser>>(
        AUTH_ROUTES.UPDATE_PROFILE,
        payload
      );
      return {
        user: response[response.keyName],
        message: response.message || 'Your details are saved',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to save your details'));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: IChangePasswordPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiMessage>(
        AUTH_ROUTES.CHANGE_PASSWORD,
        payload
      );
      return response.message || 'Password changed';
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to change password'));
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
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(login.pending, (state) => {
        state.signingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.signingIn = false;
        state.status = 'authenticated';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.signingIn = false;
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
