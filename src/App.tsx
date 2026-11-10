import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from './config/routes';
import AuthLayout from './layout/AuthLayout';
import LoginForm from './components/auth/Login';
import ForgotPasswordForm from './components/auth/ForgotPassword';
import ResetPasswordForm from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PortalLayout from './layout/PortalLayout';
import LandingPage from './components/public/LandingPage';
import StudentsManagement from './components/portal/Students/StudentsManagement';
import SubjectsManagement from './components/portal/Subjects/SubjectsManagement';
import MarksPage from './components/portal/MonthlyData/MarksPage';
import TestsPage from './components/portal/MonthlyData/TestsPage';
import ConductPage from './components/portal/MonthlyData/ConductPage';
import DashboardPage from './components/portal/Dashboard/DashboardPage';
import ProfilePage from './components/portal/Profile/ProfilePage';
import ReportsManagement from './components/portal/Reports/ReportsManagement';
import SchoolDetails from './components/portal/Settings/SchoolDetails';
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
        <Route
          path={routes.home}
          element={
            status === 'authenticated' ? (
              <Navigate to={routes.portal.dashboard} replace />
            ) : (
              <LandingPage />
            )
          }
        />

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
            <Route path={routes.portal.dashboard} element={<DashboardPage />} />
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
            <Route path={routes.portal.marks} element={<MarksPage />} />
            <Route path={routes.portal.tests} element={<TestsPage />} />
            <Route path={routes.portal.conduct} element={<ConductPage />} />
            <Route path={routes.portal.profile} element={<ProfilePage />} />
            <Route
              path={routes.portal.reports}
              element={<ReportsManagement />}
            />
            <Route path={routes.portal.settings} element={<SchoolDetails />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </Box>
  );
}

export default App;
