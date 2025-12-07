import { Box } from '@mui/material';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import ThemeShowcase from './theme/ThemeShowcase';
import { routes } from './config/routes';
import ResultCardPreview from './components/testers/ResultCardPreview';
import AuthLayout from './layout/AuthLayout';
import LoginForm from './components/auth/Login';
import ForgotPasswordForm from './components/auth/ForgotPassword';
import ResetPasswordForm from './components/auth/ResetPassword';
import PortalLayout from './layout/PortalLayout';
import StudentsManagement from './components/portal/Students/StudentsManagement';
import SubjectsManagement from './components/portal/Subjects/SubjectsManagement';
import MonthlyDataManagement from './components/portal/MonthlyData/MonthlyDataManagement';
import ReportsManagement from './components/portal/Reports/ReportsManagement';

function App() {
  const isAuthed = true; // TODO: replace with real auth state

  return (
    <Box sx={{ height: '100%' }}>
      <Routes>
        <Route path={routes.home} element={<h1>Education Tracker System</h1>} />
        <Route path="theme" element={<ThemeShowcase />} />
        <Route path="preview" element={<ResultCardPreview />} />

        {/* Auth Module */}
        <Route element={<AuthLayout />}>
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

        {/* TODO: Protected Routes */}
        <Route
          element={
            isAuthed ? (
              <PortalLayout />
            ) : (
              <Navigate to={routes.auth.login} replace />
            )
          }
        >
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
            path={routes.portal.monthlyData}
            element={<MonthlyDataManagement />}
          />
          <Route path={routes.portal.reports} element={<ReportsManagement />} />
          <Route path={routes.portal.settings} element={<div>Settings</div>} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
