import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';
import { STUDENT_ROUTES } from '../../services/apiRoutes';
import type {
  Student,
  StudentFormValues,
} from '../../components/portal/Students/@types/student.d';

interface StudentState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk('students/fetchAll', async () => {
  const response = await apiClient.get<any>(STUDENT_ROUTES.GET_ALL_STUDENTS);
  return response?.[response?.keyName];
});

export const addStudent = createAsyncThunk(
  'students/add',
  async (student: StudentFormValues) => {
    const response = await apiClient.post<any>(STUDENT_ROUTES.CREATE_STUDENT, {
      ...student,
      isActive: true,
    });
    return response?.[response?.keyName];
  }
);

export const editStudent = createAsyncThunk(
  'students/edit',
  async ({
    externalId,
    data,
  }: {
    externalId: string;
    data: Partial<StudentFormValues>;
  }) => {
    const response = await apiClient.put<any>(
      STUDENT_ROUTES.UPDATE_STUDENT(externalId),
      data
    );
    return response?.[response?.keyName];
  }
);

export const removeStudent = createAsyncThunk(
  'students/remove',
  async (externalId: string) => {
    await apiClient.delete(STUDENT_ROUTES.DELETE_STUDENT(externalId));
    return externalId;
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch students';
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.unshift(action.payload);
      })
      .addCase(editStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(
          (s) => s.externalId === action.payload.externalId
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(
          (s) => s.externalId !== action.payload
        );
      });
  },
});

export default studentSlice.reducer;
