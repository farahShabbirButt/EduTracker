import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiResponse,
} from '../../services/apiClient';
import { INSTITUTE_ROUTES } from '../../services/apiRoutes';

export type Institute = {
  externalId: string;
  name: string;
  address: string;
  phone: string;
  schoolYearStartMonth: number;
};

export type InstituteFormValues = Omit<Institute, 'externalId'>;

interface InstituteState {
  // null until the school's details are entered
  institute: Institute | null;
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
}

const initialState: InstituteState = {
  institute: null,
  loading: false,
  requestId: null,
  error: null,
};

export const fetchInstitute = createAsyncThunk(
  'institute/fetch',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<
        ApiResponse<'institute', Institute | null>
      >(INSTITUTE_ROUTES.GET, { signal });
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to load school details')
      );
    }
  }
);

export const saveInstitute = createAsyncThunk(
  'institute/save',
  async (details: InstituteFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<'institute', Institute>>(
        INSTITUTE_ROUTES.SAVE,
        details
      );
      return {
        institute: response[response.keyName],
        message:
          response.userMessage || response.message || 'School details saved',
      };
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to save school details')
      );
    }
  }
);

const instituteSlice = createSlice({
  name: 'institute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstitute.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchInstitute.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.institute = action.payload;
      })
      .addCase(fetchInstitute.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error = (action.payload as string) || 'Failed to load';
      })
      .addCase(saveInstitute.fulfilled, (state, action) => {
        state.institute = action.payload.institute;
      });
  },
});

export default instituteSlice.reducer;
