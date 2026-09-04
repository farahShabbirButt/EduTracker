import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { REPORT_ROUTES } from '../../services/apiRoutes';
import type { IReportCard } from '../../components/portal/Reports/@types/reportCard.d';

interface ReportState {
  report: IReportCard | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  report: null,
  loading: false,
  error: null,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

// SESSION mode is deliberately out of scope for this slice — the backend
// rejects it with a 400, and the UI never offers it as a selectable option.
export type FetchReportParams = {
  studentExternalId: string;
  year: number;
};

export const fetchReport = createAsyncThunk(
  'report/fetch',
  async (params: FetchReportParams, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({
        mode: 'MONTHLY',
        year: String(params.year),
      }).toString();
      const response = await apiClient.get<any>(
        REPORT_ROUTES.STUDENT_REPORT(params.studentExternalId, query)
      );
      // A year with no data is a normal 200 (rows: [], overall all zeros,
      // position: null) — not an error, and rendered as-is by ResultCard.
      return response?.[response?.keyName] as IReportCard;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to load report'));
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    // Clears the loaded report (and its error) when the preview closes or the
    // student/year selection changes, so a stale card never lingers.
    clearReport: (state) => {
      state.report = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        // An aborted request (superseded by a newer selection) isn't a real
        // failure — don't flash an error banner for it.
        if (action.meta.aborted) return;
        state.report = null;
        state.error = (action.payload as string) || 'Failed to load report';
      });
  },
});

export const { clearReport } = reportSlice.actions;
export default reportSlice.reducer;
