import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { GRADE_ROUTES } from '../../services/apiRoutes';
import type {
  ApiGradeScale,
  GradeScaleFormValues,
} from '../../components/portal/Subjects/@types/subject.d';

interface GradeState {
  gradeScales: ApiGradeScale[];
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
}

const initialState: GradeState = {
  gradeScales: [],
  loading: false,
  requestId: null,
  error: null,
};

export const fetchGradeScales = createAsyncThunk(
  'grades/fetchAll',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<
        ApiResponse<'gradeScales', ApiGradeScale[]>
      >(GRADE_ROUTES.GET_ALL, { signal });
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to fetch grade scales')
      );
    }
  }
);

export const addGradeScale = createAsyncThunk(
  'grades/add',
  async (data: GradeScaleFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<
        ApiResponse<'gradeScale', ApiGradeScale>
      >(GRADE_ROUTES.CREATE, data);
      return {
        gradeScale: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Grade band added successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to add grade band'));
    }
  }
);

export const editGradeScale = createAsyncThunk(
  'grades/edit',
  async (
    {
      externalId,
      data,
    }: { externalId: string; data: Partial<GradeScaleFormValues> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<
        ApiResponse<'gradeScale', ApiGradeScale>
      >(GRADE_ROUTES.UPDATE(externalId), data);
      return {
        gradeScale: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Grade band updated successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to update grade band'));
    }
  }
);

export const removeGradeScale = createAsyncThunk(
  'grades/remove',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<ApiMessage>(
        GRADE_ROUTES.DELETE(externalId)
      );
      return {
        externalId,
        message:
          response.userMessage ||
          response.message ||
          'Grade band deleted successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete grade band'));
    }
  }
);

const gradeSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGradeScales.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchGradeScales.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.gradeScales = action.payload;
      })
      .addCase(fetchGradeScales.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error =
          (action.payload as string) || 'Failed to fetch grade scales';
      })
      .addCase(addGradeScale.fulfilled, (state, action) => {
        state.gradeScales.push(action.payload.gradeScale);
      })
      .addCase(addGradeScale.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to add grade band';
      })
      .addCase(editGradeScale.fulfilled, (state, action) => {
        const updated = action.payload.gradeScale;
        const index = state.gradeScales.findIndex(
          (g) => g.externalId === updated.externalId
        );
        if (index !== -1) {
          state.gradeScales[index] = updated;
        }
      })
      .addCase(editGradeScale.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update grade band';
      })
      .addCase(removeGradeScale.fulfilled, (state, action) => {
        state.gradeScales = state.gradeScales.filter(
          (g) => g.externalId !== action.payload.externalId
        );
      })
      .addCase(removeGradeScale.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to delete grade band';
      });
  },
});

export default gradeSlice.reducer;
