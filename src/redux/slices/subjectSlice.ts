import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiEnvelopeError } from '../../services/apiClient';
import { SUBJECT_ROUTES, SUBJECT_CLASS_ROUTES } from '../../services/apiRoutes';
import type {
  ApiSubject,
  SubjectFormValues,
} from '../../components/portal/Subjects/@types/subject.d';

interface SubjectState {
  subjects: ApiSubject[];
  loading: boolean;
  error: string | null;
}

const initialState: SubjectState = {
  subjects: [],
  loading: false,
  error: null,
};

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any>(
        SUBJECT_ROUTES.GET_ALL_SUBJECTS
      );
      return response?.[response?.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch subjects'));
    }
  }
);

export const addSubject = createAsyncThunk(
  'subjects/add',
  async (subject: SubjectFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>(
        SUBJECT_ROUTES.CREATE_SUBJECT,
        subject
      );
      return {
        subject: response?.[response?.keyName] as ApiSubject,
        message: (response?.userMessage ||
          response?.message ||
          'Subject added successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to add subject'));
    }
  }
);

export const editSubject = createAsyncThunk(
  'subjects/edit',
  async (
    {
      externalId,
      data,
    }: { externalId: string; data: Partial<SubjectFormValues> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<any>(
        SUBJECT_ROUTES.UPDATE_SUBJECT(externalId),
        data
      );
      return {
        subject: response?.[response?.keyName] as ApiSubject,
        message: (response?.userMessage ||
          response?.message ||
          'Subject updated successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to update subject'));
    }
  }
);

export const removeSubject = createAsyncThunk(
  'subjects/remove',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<any>(
        SUBJECT_ROUTES.DELETE_SUBJECT(externalId)
      );
      return {
        externalId,
        message: (response?.userMessage ||
          response?.message ||
          'Subject deleted successfully') as string,
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete subject'));
    }
  }
);

// Assigns the full set of subjects offered in a class (POST /subject-class/assign
// replaces the class's assignment set). Re-fetches afterwards so `classes` on
// each subject reflects the change — the assign endpoint doesn't return subjects.
export const assignSubjectsToClass = createAsyncThunk(
  'subjects/assignToClass',
  async (
    payload: { classId: string; subjectIds: string[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<any>(
        SUBJECT_CLASS_ROUTES.ASSIGN,
        payload
      );
      await dispatch(fetchSubjects());
      return (response?.userMessage ||
        response?.message ||
        'Subjects assigned successfully') as string;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to assign subjects'));
    }
  }
);

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch subjects';
      })
      .addCase(addSubject.fulfilled, (state, action) => {
        state.subjects.unshift(action.payload.subject);
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to add subject';
      })
      .addCase(editSubject.fulfilled, (state, action) => {
        const updated = action.payload.subject;
        const index = state.subjects.findIndex(
          (s) => s.externalId === updated.externalId
        );
        if (index !== -1) {
          // The update response has no `classes` field — keep the previously
          // known assignments instead of wiping them out.
          state.subjects[index] = {
            ...state.subjects[index],
            ...updated,
          };
        }
      })
      .addCase(editSubject.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update subject';
      })
      .addCase(removeSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter(
          (s) => s.externalId !== action.payload.externalId
        );
      })
      .addCase(removeSubject.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete subject';
      })
      .addCase(assignSubjectsToClass.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to assign subjects';
      });
  },
});

export default subjectSlice.reducer;
