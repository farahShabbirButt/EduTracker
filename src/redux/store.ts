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

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  students: studentReducer,
  classes: classReducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
