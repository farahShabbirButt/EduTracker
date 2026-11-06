import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiResponse,
} from '../../services/apiClient';
import { CONDUCT_ROUTES } from '../../services/apiRoutes';
import type { ConductRating } from '../../components/portal/MonthlyData/@types/conduct.d';

export type ConductRow = {
  externalId: string;
  firstName: string;
  lastName: string | null;
  rollNumber: string;
  behaviour: ConductRating | null;
  uniformCleanliness: ConductRating | null;
};

export type ClassConductQuery = {
  classExternalId: string;
  month: number;
  year: number;
};

export type SaveClassConductPayload = ClassConductQuery & {
  entries: {
    studentExternalId: string;
    behaviour: ConductRating;
    uniformCleanliness: ConductRating;
  }[];
};

interface ConductState {
  rows: ConductRow[] | null;
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  saving: boolean;
  error: string | null;
}

const initialState: ConductState = {
  rows: null,
  loading: false,
  requestId: null,
  saving: false,
  error: null,
};

export const fetchClassConduct = createAsyncThunk(
  'conduct/fetchClass',
  async (params: ClassConductQuery, { signal, rejectWithValue }) => {
    try {
      const query = new URLSearchParams({
        month: String(params.month),
        year: String(params.year),
      }).toString();
      const response = await apiClient.get<
        ApiResponse<'classConduct', { students: ConductRow[] }>
      >(CONDUCT_ROUTES.CLASS(params.classExternalId, query), { signal });
      return response[response.keyName].students;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to load conduct'));
    }
  }
);

export const saveClassConduct = createAsyncThunk(
  'conduct/saveClass',
  async (
    { classExternalId, ...data }: SaveClassConductPayload,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<
        ApiResponse<'classConduct', { saved: number }>
      >(CONDUCT_ROUTES.SAVE_CLASS(classExternalId), data);
      return response.userMessage || response.message || 'Conduct saved';
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to save conduct'));
    }
  }
);

const conductSlice = createSlice({
  name: 'conduct',
  initialState,
  reducers: {
    // A stale list must never linger under a new selection
    clearClassConduct: (state) => {
      state.rows = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassConduct.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchClassConduct.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(fetchClassConduct.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.rows = null;
        state.error = (action.payload as string) || 'Failed to load conduct';
      })
      .addCase(saveClassConduct.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveClassConduct.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveClassConduct.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { clearClassConduct } = conductSlice.actions;
export default conductSlice.reducer;
