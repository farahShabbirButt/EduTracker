import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { SCORE_ROUTES } from '../../services/apiRoutes';

// Real `GET /student-score/entry` response shape (see edutracker-backend
// StudentScoreService.getMarksEntryStudents). `test.maxMarks` is THIS
// subject's per-test maximum, not the test's overall totalMarks.
export type MarksEntryStudent = {
  externalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  rollNumber: string;
  marksObtained: number | null;
};

export type MarksEntryData = {
  class: { externalId: string; name: string };
  test: {
    externalId: string;
    name: string;
    totalMarks: number;
    maxMarks: number;
    month: number;
    year: number;
  };
  subject: { externalId: string; name: string };
  students: MarksEntryStudent[];
};

export type MarksEntryQuery = {
  classExternalId: string;
  testExternalId: string;
  subjectExternalId: string;
};

export type ScoreItem = {
  studentExternalId: string;
  marksObtained: number;
};

export type SaveMarksEntryPayload = MarksEntryQuery & {
  scores: ScoreItem[];
};

interface ScoreState {
  marksEntry: MarksEntryData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ScoreState = {
  marksEntry: null,
  loading: false,
  saving: false,
  error: null,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export const fetchMarksEntry = createAsyncThunk(
  'scores/fetchEntry',
  async (params: MarksEntryQuery, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await apiClient.get<any>(
        SCORE_ROUTES.GET_MARKS_ENTRY(query)
      );
      return response?.[response?.keyName] as MarksEntryData;
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to load students and marks')
      );
    }
  }
);

export const saveMarksEntry = createAsyncThunk(
  'scores/save',
  async (payload: SaveMarksEntryPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(
        SCORE_ROUTES.ENTER_MARKS,
        payload
      );
      return {
        skippedStudentsCount: (response?.[response?.keyName]
          ?.skippedStudentsCount ?? 0) as number,
        message: (response?.userMessage ||
          response?.message ||
          'Marks saved successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to save marks'));
    }
  }
);

const scoreSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    // Clears the loaded entry (and its error) when the user changes class/test
    // selection, so a stale student list never lingers under a new selection.
    clearMarksEntry: (state) => {
      state.marksEntry = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarksEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarksEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.marksEntry = action.payload;
      })
      .addCase(fetchMarksEntry.rejected, (state, action) => {
        state.loading = false;
        // An aborted request (superseded by a newer selection) isn't a real
        // failure — don't flash an error banner for it.
        if (action.meta.aborted) return;
        state.marksEntry = null;
        state.error =
          (action.payload as string) || 'Failed to load students and marks';
      })
      .addCase(saveMarksEntry.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveMarksEntry.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveMarksEntry.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || 'Failed to save marks';
      });
  },
});

export const { clearMarksEntry } = scoreSlice.actions;
export default scoreSlice.reducer;
