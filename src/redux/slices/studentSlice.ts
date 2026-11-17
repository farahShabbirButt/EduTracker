import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiClient,
  messageFrom,
  type ApiMessage,
  type ApiResponse,
} from '../../services/apiClient';
import { STUDENT_ROUTES } from '../../services/apiRoutes';
import type { SheetRow } from '../../common/import/readSheet';
import type { ImportResult } from '../../common/import/importTypes';
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
  // Only a failed list load, not a failed save
  loadError: string | null;
}

const initialState: StudentState = {
  students: [],
  loading: false,
  requestId: null,
  error: null,
  loadError: null,
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

export type StudentImportField =
  | 'className'
  | 'rollNumber'
  | 'firstName'
  | 'lastName'
  | 'fatherName'
  | 'contactNo'
  | 'email'
  | 'electives'
  | 'joinedOn';

// The preview (dryRun) and the save both go here. A write, so never aborted.
export const importStudents = createAsyncThunk(
  'students/import',
  async (
    {
      rows,
      dryRun,
      classId,
      joinedOn,
    }: {
      rows: SheetRow<StudentImportField>[];
      dryRun: boolean;
      // One class for every row, or undefined to read each row's Class
      classId?: string;
      // For rows without their own Joined on
      joinedOn: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<
        ApiResponse<'studentImport', ImportResult<Student>>
      >(STUDENT_ROUTES.IMPORT_STUDENTS, {
        dryRun,
        classId,
        joinedOn,
        rows: rows.map((r) => ({
          row: r.row,
          ...r.values,
          // The picked class wins; don't send a column that isn't used
          ...(classId && { className: undefined }),
        })),
      });
      return {
        result: response[response.keyName],
        message:
          response.userMessage || response.message || 'Students imported',
      };
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, "The file couldn't be checked")
      );
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
        state.loadError = null;
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
        state.loadError = state.error;
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
