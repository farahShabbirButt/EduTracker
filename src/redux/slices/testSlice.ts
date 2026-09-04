import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { TEST_ROUTES } from '../../services/apiRoutes';
import type {
  ApiTest,
  ApiTestSubject,
  TestFormValues,
  TestSubjectInput,
  TestUpdateValues,
} from '../../components/portal/MonthlyData/@types/testData.d';

interface TestState {
  tests: ApiTest[];
  loading: boolean;
  error: string | null;
  testSubjects: ApiTestSubject[];
  testSubjectsLoading: boolean;
}

const initialState: TestState = {
  tests: [],
  loading: false,
  error: null,
  testSubjects: [],
  testSubjectsLoading: false,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async (
    filters:
      | { classExternalId?: string; month?: number; year?: number }
      | undefined,
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters?.classExternalId)
        params.set('classExternalId', filters.classExternalId);
      if (filters?.month) params.set('month', String(filters.month));
      if (filters?.year) params.set('year', String(filters.year));
      const query = params.toString();
      const response = await apiClient.get<any>(
        query
          ? `${TEST_ROUTES.GET_ALL_TESTS}?${query}`
          : TEST_ROUTES.GET_ALL_TESTS
      );
      return response?.[response?.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch tests'));
    }
  }
);

export const addTest = createAsyncThunk(
  'tests/add',
  async (data: TestFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(TEST_ROUTES.CREATE_TEST, data);
      return {
        test: response?.[response?.keyName] as ApiTest,
        message: (response?.userMessage ||
          response?.message ||
          'Test created successfully') as string,
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
      const response = await apiClient.put<any>(
        TEST_ROUTES.UPDATE_TEST(externalId),
        data
      );
      return {
        test: response?.[response?.keyName] as ApiTest,
        message: (response?.userMessage ||
          response?.message ||
          'Test updated successfully') as string,
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
      const response = await apiClient.delete<any>(
        TEST_ROUTES.DELETE_TEST(externalId)
      );
      return {
        externalId,
        message: (response?.userMessage ||
          response?.message ||
          'Test deleted successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete test'));
    }
  }
);

export const fetchTestSubjects = createAsyncThunk(
  'tests/fetchSubjects',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any>(
        TEST_ROUTES.GET_TEST_SUBJECTS(externalId)
      );
      return response?.[response?.keyName] as ApiTestSubject[];
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to fetch test subjects')
      );
    }
  }
);

// PUT /test/:externalId/subjects refuses to drop a subject that already has
// scores entered (409 TEST_SUBJECT_HAS_SCORES) — that message must reach the
// user, not be swallowed as a generic failure.
export const updateTestSubjects = createAsyncThunk(
  'tests/updateSubjects',
  async (
    {
      externalId,
      subjects,
    }: { externalId: string; subjects: TestSubjectInput[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<any>(
        TEST_ROUTES.SET_TEST_SUBJECTS(externalId),
        { subjects }
      );
      return {
        testSubjects: response?.[response?.keyName] as ApiTestSubject[],
        message: (response?.userMessage ||
          response?.message ||
          'Test subjects updated successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Failed to update test subjects')
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
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch tests';
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
      .addCase(fetchTestSubjects.pending, (state) => {
        state.testSubjectsLoading = true;
      })
      .addCase(fetchTestSubjects.fulfilled, (state, action) => {
        state.testSubjectsLoading = false;
        state.testSubjects = action.payload;
      })
      .addCase(fetchTestSubjects.rejected, (state, action) => {
        state.testSubjectsLoading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch test subjects';
      })
      .addCase(updateTestSubjects.fulfilled, (state, action) => {
        state.testSubjects = action.payload.testSubjects;
        // The subjects change also recomputes the parent test's totalMarks —
        // reflect that in the already-loaded test so the list/table stay accurate
        // without a full refetch.
        const total = action.payload.testSubjects.reduce(
          (sum, ts) => sum + (Number(ts.maxMarks) || 0),
          0
        );
        const index = state.tests.findIndex(
          (t) =>
            t.externalId ===
            (action.meta.arg as { externalId: string }).externalId
        );
        if (index !== -1) {
          state.tests[index] = { ...state.tests[index], totalMarks: total };
        }
      })
      .addCase(updateTestSubjects.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update test subjects';
      });
  },
});

export default testSlice.reducer;
