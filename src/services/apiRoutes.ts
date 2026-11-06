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
  GET_GRID: (query: string) => `/student-score/grid?${query}`,
  SAVE_GRID: '/student-score/grid',
};

export const CONDUCT_ROUTES = {
  CLASS: (classExternalId: string, query: string) =>
    `/conduct/class/${classExternalId}?${query}`,
  SAVE_CLASS: (classExternalId: string) => `/conduct/class/${classExternalId}`,
};

export const DASHBOARD_ROUTES = {
  GET: '/dashboard',
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
  UPDATE_PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/password',
  RESET_PASSWORD: '/auth/reset-password',
};
