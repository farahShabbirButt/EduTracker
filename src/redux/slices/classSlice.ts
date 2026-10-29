import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { CLASS_ROUTES } from '../../services/apiRoutes';
import type {
  Class,
  ClassFormValues,
} from '../../components/portal/Classes/@types/class.d';

interface ClassState {
  classes: Class[];
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classes: [],
  loading: false,
  error: null,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export const fetchClasses = createAsyncThunk(
  'classes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any>(CLASS_ROUTES.GET_ALL_CLASSES);
      return response?.[response?.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch classes'));
    }
  }
);

export const addClass = createAsyncThunk(
  'classes/add',
  async (classData: ClassFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(
        CLASS_ROUTES.CREATE_CLASS,
        classData
      );
      return {
        class: response?.[response?.keyName] as Class,
        message: (response?.userMessage ||
          response?.message ||
          'Class added successfully') as string,
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
      const response = await apiClient.put<any>(
        CLASS_ROUTES.UPDATE_CLASS(externalId),
        data
      );
      return {
        class: response?.[response?.keyName] as Class,
        message: (response?.userMessage ||
          response?.message ||
          'Class updated successfully') as string,
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
      const response = await apiClient.delete<any>(
        CLASS_ROUTES.DELETE_CLASS(externalId)
      );
      return {
        externalId,
        message: (response?.userMessage ||
          response?.message ||
          'Class deleted successfully') as string,
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
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch classes';
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
