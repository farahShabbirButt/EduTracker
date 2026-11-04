import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { STUDENT_ROUTES } from '../../services/apiRoutes';
import type {
  Student,
  StudentFormValues,
} from '../../components/portal/Students/@types/student.d';

interface StudentState {
  students: Student[];
  loading: boolean;
  // Latest fetch only: an aborted or superseded one must not touch the state
  requestId: string | null;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  loading: false,
  requestId: null,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<'students', Student[]>>(
        STUDENT_ROUTES.GET_ALL_STUDENTS,
        { signal }
      );
      return response[response.keyName];
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to fetch students'));
    }
  }
);

export const addStudent = createAsyncThunk(
  'students/add',
  async (student: StudentFormValues, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<'student', Student>>(
        STUDENT_ROUTES.CREATE_STUDENT,
        {
          ...student,
          isActive: true,
        }
      );
      return {
        student: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Student added successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to add student'));
    }
  }
);

export const editStudent = createAsyncThunk(
  'students/edit',
  async (
    {
      externalId,
      data,
    }: {
      externalId: string;
      data: Partial<StudentFormValues>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put<ApiResponse<'student', Student>>(
        STUDENT_ROUTES.UPDATE_STUDENT(externalId),
        data
      );
      return {
        student: response[response.keyName],
        message:
          response.userMessage ||
          response.message ||
          'Student updated successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to update student'));
    }
  }
);

export const removeStudent = createAsyncThunk(
  'students/remove',
  async (externalId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete<ApiMessage>(
        STUDENT_ROUTES.DELETE_STUDENT(externalId)
      );
      return {
        externalId,
        message:
          response.userMessage ||
          response.message ||
          'Student deleted successfully',
      };
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Failed to delete student'));
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state, action) => {
        state.loading = true;
        state.requestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        if (action.meta.aborted) return;
        state.error = (action.payload as string) || 'Failed to fetch students';
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.unshift(action.payload.student);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to add student';
      })
      .addCase(editStudent.fulfilled, (state, action) => {
        const updated = action.payload.student;
        const index = state.students.findIndex(
          (s) => s.externalId === updated.externalId
        );
        if (index !== -1) {
          state.students[index] = updated;
        }
      })
      .addCase(editStudent.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update student';
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(
          (s) => s.externalId !== action.payload.externalId
        );
      })
      .addCase(removeStudent.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete student';
      });
  },
});

export default studentSlice.reducer;
