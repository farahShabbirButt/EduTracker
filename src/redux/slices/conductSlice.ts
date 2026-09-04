import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { CONDUCT_ROUTES } from '../../services/apiRoutes';
import type {
  ApiConduct,
  ConductFormValues,
} from '../../components/portal/MonthlyData/@types/conduct.d';

interface ConductState {
  conduct: ApiConduct | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ConductState = {
  conduct: null,
  loading: false,
  saving: false,
  error: null,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export type FetchConductParams = {
  studentExternalId: string;
  month: number;
  year: number;
};

export const fetchConduct = createAsyncThunk(
  'conduct/fetch',
  async (params: FetchConductParams, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({
        month: String(params.month),
        year: String(params.year),
      }).toString();
      const response = await apiClient.get<any>(
        CONDUCT_ROUTES.GET_CONDUCT(params.studentExternalId, query)
      );
      // A student with nothing recorded yet returns `null` under `keyName`
      // with HTTP 200 — that's the normal "not set" state, not an error.
      return (response?.[response?.keyName] ?? null) as ApiConduct | null;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to load conduct'));
    }
  }
);

export type SaveConductParams = {
  studentExternalId: string;
} & ConductFormValues;

export const saveConduct = createAsyncThunk(
  'conduct/save',
  async (
    { studentExternalId, ...data }: SaveConductParams,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<any>(
        CONDUCT_ROUTES.SAVE_CONDUCT(studentExternalId),
        data
      );
      return {
        conduct: response?.[response?.keyName] as ApiConduct,
        message: (response?.userMessage ||
          response?.message ||
          'Conduct saved successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to save conduct'));
    }
  }
);

const conductSlice = createSlice({
  name: 'conduct',
  initialState,
  reducers: {
    // Clears the loaded record (and its error) when the student/month/year
    // selection changes, so a stale record never lingers under a new selection.
    clearConduct: (state) => {
      state.conduct = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConduct.fulfilled, (state, action) => {
        state.loading = false;
        state.conduct = action.payload;
      })
      .addCase(fetchConduct.rejected, (state, action) => {
        state.loading = false;
        // An aborted request (superseded by a newer selection) isn't a real
        // failure — don't flash an error banner for it.
        if (action.meta.aborted) return;
        state.conduct = null;
        state.error = (action.payload as string) || 'Failed to load conduct';
      })
      .addCase(saveConduct.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveConduct.fulfilled, (state, action) => {
        state.saving = false;
        state.conduct = action.payload.conduct;
      })
      .addCase(saveConduct.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || 'Failed to save conduct';
      });
  },
});

export const { clearConduct } = conductSlice.actions;
export default conductSlice.reducer;
