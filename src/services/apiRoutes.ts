export const STUDENT_ROUTES = {
  CREATE_STUDENT: '/student',
  UPDATE_STUDENT: (id: string) => `/student/${id}`,
  GET_ALL_STUDENTS: '/student',
  GET_STUDENT_BY_ID: (id: string) => `/student/${id}`,
  GET_STUDENTS_BY_CLASS_ID: (id: string) => `/student/class/${id}`,
  DELETE_STUDENT: (id: string) => `/student/${id}`,
};

export const SUBJECT_ROUTES = {
  CREATE_SUBJECT: '/subject',
  UPDATE_SUBJECT: (id: string) => `/subject/${id}`,
  GET_ALL_SUBJECTS: '/subject',
  GET_SUBJECT_BY_ID: (id: string) => `/subject/${id}`,
  DELETE_SUBJECT: (id: string) => `/subject/${id}`,
};

export const SUBJECT_CLASS_ROUTES = { ASSIGN: '/subject-class/assign' };
export const GRADE_ROUTES = {
  GET_ALL: '/grade-scale',
  CREATE: '/grade-scale',
  UPDATE: (id: string) => `/grade-scale/${id}`,
  DELETE: (id: string) => `/grade-scale/${id}`,
};

export const CLASS_ROUTES = {
  CREATE_CLASS: '/class',
  UPDATE_CLASS: (id: string) => `/class/${id}`,
  GET_ALL_CLASSES: '/class',
  GET_CLASS_BY_ID: (id: string) => `/class/${id}`,
  DELETE_CLASS: (id: string) => `/class/${id}`,
};

export const TEST_ROUTES = {
  CREATE_TEST: '/test',
  UPDATE_TEST: (id: string) => `/test/${id}`,
  GET_ALL_TESTS: '/test',
  GET_TEST_BY_ID: (id: string) => `/test/${id}`,
  DELETE_TEST: (id: string) => `/test/${id}`,
  GET_TEST_SUBJECTS: (id: string) => `/test/${id}/subjects`,
  SET_TEST_SUBJECTS: (id: string) => `/test/${id}/subjects`,
};

export const SCORE_ROUTES = {
  ENTER_MARKS: '/student-score/entry',
  GET_MARKS_ENTRY: (query: string) => `/student-score/entry?${query}`,
};

export const CONDUCT_ROUTES = {
  GET_CONDUCT: (studentExternalId: string, query: string) =>
    `/conduct/student/${studentExternalId}?${query}`,
  SAVE_CONDUCT: (studentExternalId: string) =>
    `/conduct/student/${studentExternalId}`,
};

export const REPORT_ROUTES = {
  STUDENT_REPORT: (id: string, query: string) =>
    `/report/student/${id}?${query}`,
};

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};
