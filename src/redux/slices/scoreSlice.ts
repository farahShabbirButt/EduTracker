import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiResponse,
} from '../../services/apiClient';
import { SCORE_ROUTES } from '../../services/apiRoutes';

export type GridCell = {
  marksObtained: number | null;
  // False when the student doesn't take the subject: there's no cell to fill
  editable: boolean;
  // Counts towards what's still missing
  owed: boolean;
};

export type GridStudent = {
  externalId: string;
  firstName: string;
  lastName: string | null;
  rollNumber: string;
  // Holds a saved mark but has since moved to another class
  leftClass: boolean;
  cells: Record<string, GridCell>;
};

export type GridSubject = {
  externalId: string;
  name: string;
  maxMarks: number;
};

export type MarksGrid = {
  class: { externalId: string; name: string };
  test: { externalId: string; name: string; month: number; year: number };
  subjects: GridSubject[];
  students: GridStudent[];
};

export type MarksGridQuery = {
  classExternalId: string;
  testExternalId: string;
};

export type SaveMarksGridPayload = MarksGridQuery & {
  // null clears a saved mark
  marks: {
    studentExternalId: string;
    subjectExternalId: string;
    marksObtained: number | null;
  }[];
};

interface ScoreState {
  grid: MarksGrid | null;
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  saving: boolean;
  error: string | null;
}

const initialState: ScoreState = {
  grid: null,
  loading: false,
  requestId: null,
  saving: false,
  error: null,
};

export const fetchMarksGrid = createAsyncThunk(
  'scores/fetchGrid',
  async (params: MarksGridQuery, { signal, rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await apiClient.get<ApiResponse<'marksGrid', MarksGrid>>(
        SCORE_ROUTES.GET_GRID(query),
        { signal }
      );
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to load the marks'));
    }
  }
);

export const saveMarksGrid = createAsyncThunk(
  'scores/saveGrid',
  async (payload: SaveMarksGridPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<
        ApiResponse<'studentScores', { saved: number }>
      >(SCORE_ROUTES.SAVE_GRID, payload);
      return response.userMessage || response.message || 'Marks saved';
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to save marks'));
    }
  }
);

const scoreSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    // A stale grid must never linger under a new selection
    clearMarksGrid: (state) => {
      state.grid = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarksGrid.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchMarksGrid.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.grid = action.payload;
      })
      .addCase(fetchMarksGrid.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.grid = null;
        state.error = (action.payload as string) || 'Failed to load the marks';
      })
      .addCase(saveMarksGrid.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveMarksGrid.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveMarksGrid.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { clearMarksGrid } = scoreSlice.actions;
export default scoreSlice.reducer;
