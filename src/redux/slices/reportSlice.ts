import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiResponse,
} from '../../services/apiClient';
import { REPORT_ROUTES } from '../../services/apiRoutes';
import type {
  IReportCard,
  IReportPeriod,
} from '../../components/portal/Reports/@types/reportCard.d';

interface ReportState {
  report: IReportCard | null;
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
}

const initialState: ReportState = {
  report: null,
  loading: false,
  requestId: null,
  error: null,
};

// SESSION mode is deliberately out of scope for this slice — the backend
// rejects it with a 400, and the UI never offers it as a selectable option.
export type FetchReportParams = {
  studentExternalId: string;
  period: IReportPeriod;
};

export const fetchReport = createAsyncThunk(
  'report/fetch',
  async (params: FetchReportParams, { signal, rejectWithValue }) => {
    try {
      const query = new URLSearchParams({
        mode: 'MONTHLY',
        fromMonth: String(params.period.from.month),
        fromYear: String(params.period.from.year),
        toMonth: String(params.period.to.month),
        toYear: String(params.period.to.year),
      }).toString();
      const response = await apiClient.get<ApiResponse<'report', IReportCard>>(
        REPORT_ROUTES.STUDENT_REPORT(params.studentExternalId, query),
        { signal }
      );
      // A period with no data is a normal 200 (rows: [], position: null), not
      // an error. The preview says so.
      return response[response.keyName];
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
      .addCase(fetchReport.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
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
