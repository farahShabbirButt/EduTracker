import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { SUBJECT_ROUTES, SUBJECT_CLASS_ROUTES } from '../../services/apiRoutes';
import type {
  ApiSubject,
  SubjectFormValues,
} from '../../components/portal/Subjects/@types/subject.d';

interface SubjectState {
  subjects: ApiSubject[];
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
  // Only a failed list load, not a failed save
  loadError: string | null;
}

const initialState: SubjectState = {
  subjects: [],
  loading: false,
  requestId: null,
  error: null,
  loadError: null,
};

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<
        ApiResponse<'subjects', ApiSubject[]>
      >(SUBJECT_ROUTES.GET_ALL_SUBJECTS, { signal });
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch subjects'));
    }
  }
);

export const addSubject = createAsyncThunk(
  'subjects/add',
  async (subject: SubjectFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<'subject', ApiSubject>>(
        SUBJECT_ROUTES.CREATE_SUBJECT,
        subject
      );
      return {
        subject: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Subject added successfully',
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
      const response = await apiClient.put<ApiResponse<'subject', ApiSubject>>(
        SUBJECT_ROUTES.UPDATE_SUBJECT(externalId),
        data
      );
      return {
        subject: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Subject updated successfully',
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
      const response = await apiClient.delete<ApiMessage>(
        SUBJECT_ROUTES.DELETE_SUBJECT(externalId)
      );
      return {
        externalId,
        message:
          response.userMessage ||
          response.message ||
          'Subject deleted successfully',
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
      const response = await apiClient.post<ApiMessage>(
        SUBJECT_CLASS_ROUTES.ASSIGN,
        payload
      );
      const refreshed = await dispatch(fetchSubjects());
      // The next Save would write the old list back
      if (fetchSubjects.rejected.match(refreshed)) {
        return rejectWithValue(
          'Subjects saved, but the list could not refresh. Reload before assigning again'
        );
      }
      return (
        response.userMessage ||
        response.message ||
        'Subjects assigned successfully'
      );
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
      .addCase(fetchSubjects.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
        state.loadError = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error = (action.payload as string) || 'Failed to fetch subjects';
        state.loadError = state.error;
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
