export const STUDENT_ROUTES = {
  CREATE_STUDENT: '/student',
  UPDATE_STUDENT: (id: string) => `/student/${id}`,
  GET_ALL_STUDENTS: '/student',
  DELETE_STUDENT: (id: string) => `/student/${id}`,
};

export const SUBJECT_ROUTES = {
  CREATE_SUBJECT: '/subject',
  UPDATE_SUBJECT: (id: string) => `/subject/${id}`,
  GET_ALL_SUBJECTS: '/subject',
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
  DELETE_CLASS: (id: string) => `/class/${id}`,
};

export const TEST_ROUTES = {
  CREATE_TEST: '/test',
  UPDATE_TEST: (id: string) => `/test/${id}`,
  GET_ALL_TESTS: '/test',
  DELETE_TEST: (id: string) => `/test/${id}`,
  GET_TEST_SUBJECTS: (id: string) => `/test/${id}/subjects`,
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

export const INSTITUTE_ROUTES = { GET: '/institute', SAVE: '/institute' };

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
