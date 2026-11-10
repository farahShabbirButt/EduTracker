import {
  configureStore,
  combineReducers,
  isRejected,
  type Middleware,
} from '@reduxjs/toolkit';
import { compose } from 'redux';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

import authReducer from './slices/authSlice';
import studentReducer, { fetchStudents } from './slices/studentSlice';
import classReducer, { fetchClasses } from './slices/classSlice';
import subjectReducer, { fetchSubjects } from './slices/subjectSlice';
import gradeReducer, { fetchGradeScales } from './slices/gradeSlice';
import testReducer, { fetchTestSubjects, fetchTests } from './slices/testSlice';
import scoreReducer from './slices/scoreSlice';
import conductReducer from './slices/conductSlice';
import dashboardReducer, { fetchDashboard } from './slices/dashboardSlice';
import reportReducer from './slices/reportSlice';
import instituteReducer, { fetchInstitute } from './slices/instituteSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  students: studentReducer,
  classes: classReducer,
  subjects: subjectReducer,
  grades: gradeReducer,
  institute: instituteReducer,
  tests: testReducer,
  scores: scoreReducer,
  conduct: conductReducer,
  report: reportReducer,
  dashboard: dashboardReducer,
});

// A failed list load would otherwise look like an empty list. Marks entry,
// conduct and the report show their own error instead.
const isFailedListLoad = isRejected(
  fetchStudents,
  fetchClasses,
  fetchSubjects,
  fetchGradeScales,
  fetchInstitute,
  fetchTests,
  fetchTestSubjects,
  fetchDashboard
);

const listLoadErrors: Middleware = () => (next) => (action) => {
  if (isFailedListLoad(action) && !action.meta.aborted) {
    const message = (action.payload as string) || 'Failed to load data';
    toast.error(message, { toastId: message });
  }
  return next(action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listLoadErrors),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
