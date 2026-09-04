import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { compose } from 'redux';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import classReducer from './slices/classSlice';
import subjectReducer from './slices/subjectSlice';
import gradeReducer from './slices/gradeSlice';
import testReducer from './slices/testSlice';
import scoreReducer from './slices/scoreSlice';
import conductReducer from './slices/conductSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  students: studentReducer,
  classes: classReducer,
  subjects: subjectReducer,
  grades: gradeReducer,
  tests: testReducer,
  scores: scoreReducer,
  conduct: conductReducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
