import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { AppDispatch } from '../redux/store';
import { fetchInstitute } from '../redux/slices/instituteSlice';
import { fetchDashboard } from '../redux/slices/dashboardSlice';
import BottomTabs from './BottomTabs';
import { NavigationGuardProvider } from './NavigationGuard';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PortalLayout = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchInstitute());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    // Keeps the header's Needs attention list current
    dispatch(fetchDashboard());
  }, [pathname, dispatch]);

  return (
    <NavigationGuardProvider>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: { xs: 0, md: 2 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 1.5 },
            pt: { xs: 1, md: 0.5 },
            pb: { xs: 13, md: 5 },
          }}
        >
          <Topbar />
          <Box
            key={pathname}
            sx={(theme) => ({
              pt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              animation: `studio-rise ${theme.studio.motion.medium} ${theme.studio.motion.ease}`,
            })}
          >
            <Outlet />
          </Box>
        </Box>
        <BottomTabs />
      </Box>
    </NavigationGuardProvider>
  );
};

export default PortalLayout;
