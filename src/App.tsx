import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import ThemeShowcase from './theme/ThemeShowcase';
import { routes } from './config/routes';
import ResultCardPreview from './components/testers/ResultCardPreview';
import AuthLayout from './layout/AuthLayout';
import LoginForm from './components/auth/Login';
import ForgotPasswordForm from './components/auth/ForgotPassword';
import ResetPasswordForm from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PortalLayout from './layout/PortalLayout';
import StudentsManagement from './components/portal/Students/StudentsManagement';
import SubjectsManagement from './components/portal/Subjects/SubjectsManagement';
import MonthlyDataManagement from './components/portal/MonthlyData/MonthlyDataManagement';
import ReportsManagement from './components/portal/Reports/ReportsManagement';
import ClassesManagement from './components/portal/Classes/ClassesManagement';
import type { AppDispatch, RootState } from './redux/store';
import { fetchMe } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => state.auth.status);

  // The token lives in an httpOnly cookie and cannot be read from JavaScript,
  // so asking the server is the only way to know whether we have a session.
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Blocking here prevents a login-screen flash for an already-authenticated user
  // reloading the page, and prevents ProtectedRoute bouncing before we know.
  if (status === 'idle' || status === 'loading') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Routes>
        <Route path={routes.home} element={<h1>Education Tracker System</h1>} />
        <Route path="theme" element={<ThemeShowcase />} />
        <Route path="preview" element={<ResultCardPreview />} />

        {/* Auth Module */}
        <Route
          element={
            status === 'authenticated' ? (
              <Navigate to={routes.portal.dashboard} replace />
            ) : (
              <AuthLayout />
            )
          }
        >
          <Route path={routes.auth.login} element={<LoginForm />} />
          <Route
            path={routes.auth.forgetPassword}
            element={<ForgotPasswordForm />}
          />
          <Route
            path={routes.auth.resetPassword}
            element={<ResetPasswordForm />}
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PortalLayout />}>
            <Route
              index
              element={<Navigate to={routes.portal.dashboard} replace />}
            />
            <Route
              path={routes.portal.dashboard}
              element={<div>Dashboard</div>}
            />
            <Route
              path={routes.portal.student}
              element={<StudentsManagement />}
            />
            <Route
              path={routes.portal.subjects}
              element={<SubjectsManagement />}
            />
            <Route
              path={routes.portal.classes}
              element={<ClassesManagement />}
            />
            <Route
              path={routes.portal.monthlyData}
              element={<MonthlyDataManagement />}
            />
            <Route
              path={routes.portal.reports}
              element={<ReportsManagement />}
            />
            <Route
              path={routes.portal.settings}
              element={<div>Settings</div>}
            />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
