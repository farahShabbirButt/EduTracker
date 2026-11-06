import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { apiClient, type ApiResponse } from '../../services/apiClient';
import { REPORT_ROUTES } from '../../services/apiRoutes';
import type {
  IReportCard,
  IReportPeriod,
} from '../../components/portal/Reports/@types/reportCard.d';

interface ReportState {
  // By student, for the period last loaded
  cards: Record<string, IReportCard>;
  // Couldn't be loaded. Kept apart so they're retried on request, not forever.
  failed: string[];
}

const initialState: ReportState = {
  cards: {},
  failed: [],
};

// A period with no data is a normal 200 (rows: [], position: null), not an error.
const requestCard = async (
  studentExternalId: string,
  period: IReportPeriod,
  signal: AbortSignal
) => {
  const query = new URLSearchParams({
    mode: 'MONTHLY',
    fromMonth: String(period.from.month),
    fromYear: String(period.from.year),
    toMonth: String(period.to.month),
    toYear: String(period.to.year),
  }).toString();
  const response = await apiClient.get<ApiResponse<'report', IReportCard>>(
    REPORT_ROUTES.STUDENT_REPORT(studentExternalId, query),
    { signal }
  );
  return response[response.keyName];
};

// One card at a time, in order. Each lands as it arrives, so one failure loses
// only that card and the screen can show how far along it is.
export const fetchCards = createAsyncThunk(
  'report/fetchCards',
  async (
    {
      studentExternalIds,
      period,
    }: { studentExternalIds: string[]; period: IReportPeriod },
    { signal, dispatch }
  ) => {
    for (const studentExternalId of studentExternalIds) {
      if (signal.aborted) return;
      try {
        const card = await requestCard(studentExternalId, period, signal);
        dispatch(cardLoaded({ studentExternalId, card }));
      } catch {
        if (signal.aborted) return;
        dispatch(cardFailed(studentExternalId));
      }
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearCards: () => initialState,
    cardLoaded: (
      state,
      action: PayloadAction<{ studentExternalId: string; card: IReportCard }>
    ) => {
      state.cards[action.payload.studentExternalId] = action.payload.card;
    },
    cardFailed: (state, action: PayloadAction<string>) => {
      state.failed.push(action.payload);
    },
    retryFailedCards: (state) => {
      state.failed = [];
    },
  },
});

export const { clearCards, retryFailedCards } = reportSlice.actions;
const { cardLoaded, cardFailed } = reportSlice.actions;
export default reportSlice.reducer;
