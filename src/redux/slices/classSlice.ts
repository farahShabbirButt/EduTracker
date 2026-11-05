import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { CLASS_ROUTES } from '../../services/apiRoutes';
import type {
  Class,
  ClassFormValues,
} from '../../components/portal/Classes/@types/class.d';

interface ClassState {
  classes: Class[];
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
  // Only a failed list load, not a failed save
  loadError: string | null;
}

const initialState: ClassState = {
  classes: [],
  loading: false,
  requestId: null,
  error: null,
  loadError: null,
};

export const fetchClasses = createAsyncThunk(
  'classes/fetchAll',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<'classes', Class[]>>(
        CLASS_ROUTES.GET_ALL_CLASSES,
        { signal }
      );
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch classes'));
    }
  }
);

export const addClass = createAsyncThunk(
  'classes/add',
  async (classData: ClassFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<'class', Class>>(
        CLASS_ROUTES.CREATE_CLASS,
        classData
      );
      return {
        class: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Class added successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to add class'));
    }
  }
);

export const editClass = createAsyncThunk(
  'classes/edit',
  async (
    {
      externalId,
      data,
    }: {
      externalId: string;
      data: ClassFormValues;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<ApiResponse<'class', Class>>(
        CLASS_ROUTES.UPDATE_CLASS(externalId),
        data
      );
      return {
        class: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Class updated successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to update class'));
    }
  }
);

export const removeClass = createAsyncThunk(
  'classes/remove',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<ApiMessage>(
        CLASS_ROUTES.DELETE_CLASS(externalId)
      );
      return {
        externalId,
        message:
          response.userMessage ||
          response.message ||
          'Class deleted successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete class'));
    }
  }
);

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
        state.loadError = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error = (action.payload as string) || 'Failed to fetch classes';
        state.loadError = state.error;
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.classes.unshift(action.payload.class);
      })
      .addCase(addClass.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to add class';
      })
      .addCase(editClass.fulfilled, (state, action) => {
        const updated = action.payload.class;
        const index = state.classes.findIndex(
          (c) => c.externalId === updated.externalId
        );
        if (index !== -1) {
          state.classes[index] = updated;
        }
      })
      .addCase(editClass.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update class';
      })
      .addCase(removeClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(
          (c) => c.externalId !== action.payload.externalId
        );
      })
      .addCase(removeClass.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete class';
      });
  },
});

export default classSlice.reducer;
