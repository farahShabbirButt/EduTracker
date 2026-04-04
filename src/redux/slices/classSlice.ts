import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';
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

export const fetchClasses = createAsyncThunk('classes/fetchAll', async () => {
  const response = await apiClient.get<any>(CLASS_ROUTES.GET_ALL_CLASSES);
  return response?.[response?.keyName];
});

export const addClass = createAsyncThunk(
  'classes/add',
  async (classData: ClassFormValues) => {
    const response = await apiClient.post<any>(
      CLASS_ROUTES.CREATE_CLASS,
      classData
    );
    return response?.[response?.keyName];
  }
);

export const editClass = createAsyncThunk(
  'classes/edit',
  async ({
    externalId,
    data,
  }: {
    externalId: string;
    data: ClassFormValues;
  }) => {
    const response = await apiClient.put<any>(
      CLASS_ROUTES.UPDATE_CLASS(externalId),
      data
    );
    return response?.[response?.keyName];
  }
);

export const removeClass = createAsyncThunk(
  'classes/remove',
  async (externalId: string) => {
    await apiClient.delete(CLASS_ROUTES.DELETE_CLASS(externalId));
    return externalId;
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
        state.error = action.error.message || 'Failed to fetch classes';
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.classes.unshift(action.payload);
      })
      .addCase(editClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(
          (c) => c.externalId === action.payload.externalId
        );
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(removeClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(
          (c) => c.externalId !== action.payload
        );
      });
  },
});

export default classSlice.reducer;
