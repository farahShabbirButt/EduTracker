import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiResponse,
} from '../../services/apiClient';
import { DASHBOARD_ROUTES } from '../../services/apiRoutes';

export type AttentionItem = {
  title: string;
  detail: string;
  link: 'marks' | 'conduct' | 'subjects' | 'grades';
  classExternalId?: string;
  testExternalId?: string;
};

export type DashboardTest = {
  externalId: string;
  name: string;
  class: { externalId: string; name: string };
  entered: number;
  expected: number;
};

export type DashboardData = {
  month: number;
  year: number;
  counts: {
    students: number;
    classes: number;
    subjects: number;
    testsThisMonth: number;
  };
  marks: { entered: number; expected: number };
  tests: DashboardTest[];
  attention: AttentionItem[];
  setup: {
    classes: boolean;
    subjects: boolean;
    students: boolean;
    gradeBands: boolean;
  };
};

interface DashboardState {
  dashboard: DashboardData | null;
  requestId: string | null;
  loadError: string | null;
}

const initialState: DashboardState = {
  dashboard: null,
  requestId: null,
  loadError: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<
        ApiResponse<'dashboard', DashboardData>
      >(DASHBOARD_ROUTES.GET, { signal });
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to load the dashboard')
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state, action) => {
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.dashboard = action.payload;
        state.loadError = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        if (action.meta.aborted) return;
        state.loadError =
          (action.payload as string) || 'Failed to load the dashboard';
      });
  },
});

export default dashboardSlice.reducer;
