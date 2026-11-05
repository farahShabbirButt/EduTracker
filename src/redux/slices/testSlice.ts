import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { TEST_ROUTES } from '../../services/apiRoutes';
import type {
  ApiTest,
  ApiTestSubject,
  TestFormValues,
  TestUpdateValues,
} from '../../components/portal/MonthlyData/@types/testData.d';

interface TestState {
  tests: ApiTest[];
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
  // Only a failed list load, not a failed save
  loadError: string | null;
  testSubjects: ApiTestSubject[];
  testSubjectsLoading: boolean;
  testSubjectsError: string | null;
  // Latest fetch only: an aborted or superseded one must not touch the state
  testSubjectsRequestId: string | null;
}

const initialState: TestState = {
  tests: [],
  loading: false,
  requestId: null,
  error: null,
  loadError: null,
  testSubjects: [],
  testSubjectsLoading: false,
  testSubjectsError: null,
  testSubjectsRequestId: null,
};

export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async (
    filters:
      | { classExternalId?: string; month?: number; year?: number }
      | undefined,
    { signal, rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters?.classExternalId)
        params.set('classExternalId', filters.classExternalId);
      if (filters?.month) params.set('month', String(filters.month));
      if (filters?.year) params.set('year', String(filters.year));
      const query = params.toString();
      const response = await apiClient.get<ApiResponse<'tests', ApiTest[]>>(
        query
          ? `${TEST_ROUTES.GET_ALL_TESTS}?${query}`
          : TEST_ROUTES.GET_ALL_TESTS,
        { signal }
      );
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch tests'));
    }
  }
);

export const addTest = createAsyncThunk(
  'tests/add',
  async (data: TestFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<'test', ApiTest>>(
        TEST_ROUTES.CREATE_TEST,
        data
      );
      return {
        test: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Test created successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to create test'));
    }
  }
);

export const editTest = createAsyncThunk(
  'tests/edit',
  async (
    { externalId, data }: { externalId: string; data: TestUpdateValues },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<ApiResponse<'test', ApiTest>>(
        TEST_ROUTES.UPDATE_TEST(externalId),
        data
      );
      return {
        test: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Test updated successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to update test'));
    }
  }
);

export const removeTest = createAsyncThunk(
  'tests/remove',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<ApiMessage>(
        TEST_ROUTES.DELETE_TEST(externalId)
      );
      return {
        externalId,
        message:
          response.userMessage ||
          response.message ||
          'Test deleted successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete test'));
    }
  }
);

export const fetchTestSubjects = createAsyncThunk(
  'tests/fetchSubjects',
  async (externalId: string, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<
        ApiResponse<'testSubjects', ApiTestSubject[]>
      >(TEST_ROUTES.GET_TEST_SUBJECTS(externalId), { signal });
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to fetch test subjects')
      );
    }
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
        state.loadError = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error = (action.payload as string) || 'Failed to fetch tests';
        state.loadError = state.error;
      })
      .addCase(addTest.fulfilled, (state, action) => {
        state.tests.unshift(action.payload.test);
      })
      .addCase(addTest.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to create test';
      })
      .addCase(editTest.fulfilled, (state, action) => {
        const updated = action.payload.test;
        const index = state.tests.findIndex(
          (t) => t.externalId === updated.externalId
        );
        if (index !== -1) {
          state.tests[index] = updated;
        }
      })
      .addCase(editTest.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update test';
      })
      .addCase(removeTest.fulfilled, (state, action) => {
        state.tests = state.tests.filter(
          (t) => t.externalId !== action.payload.externalId
        );
      })
      .addCase(removeTest.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete test';
      })
      .addCase(fetchTestSubjects.pending, (state, action) => {
        state.testSubjectsLoading = true;
        state.testSubjectsRequestId = action.meta.requestId;
        state.testSubjectsError = null;
        // Never leave one test's subjects on screen for the next test
        state.testSubjects = [];
      })
      .addCase(fetchTestSubjects.fulfilled, (state, action) => {
        if (state.testSubjectsRequestId !== action.meta.requestId) return;
        state.testSubjectsLoading = false;
        state.testSubjects = action.payload;
      })
      .addCase(fetchTestSubjects.rejected, (state, action) => {
        if (state.testSubjectsRequestId !== action.meta.requestId) return;
        state.testSubjectsLoading = false;
        if (action.meta.aborted) return;
        state.testSubjectsError =
          (action.payload as string) || 'Failed to fetch test subjects';
      });
  },
});

export default testSlice.reducer;
