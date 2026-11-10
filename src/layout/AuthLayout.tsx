import { Box, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { appInfo } from '../config/appInfo';
import { routes } from '../config/routes';
import AuthShowcase from './AuthShowcase';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '1fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          alignContent: 'center',
          justifyItems: 'center',
          p: { xs: 3, md: 5 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            insetInlineEnd: 16,
          }}
        >
          <ThemeToggle />
        </Box>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box
            component={RouterLink}
            to={routes.home}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              mb: 4,
              color: 'text.primary',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 17,
            }}
          >
            <Box
              sx={(theme) => ({
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: `${theme.studio.radii.small}px`,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              })}
            >
              <SchoolOutlinedIcon fontSize="small" />
            </Box>
            {appInfo.appName}
          </Box>
          <Box
            sx={(theme) => ({
              animation: `studio-rise ${theme.studio.motion.medium} ${theme.studio.motion.ease}`,
            })}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      <Box
        component="aside"
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 5,
          m: 2,
          p: { md: 4, lg: 6 },
          overflow: 'hidden',
          borderRadius: `${theme.studio.radii.xlarge}px`,
          bgcolor: theme.palette.studio.hero,
          backgroundImage: `radial-gradient(70% 60% at 50% 34%, ${theme.palette.studio.heroGlow}, transparent)`,
          color: theme.palette.studio.sidebarInkStrong,
        })}
      >
        <Box sx={{ flex: 1, display: 'grid', alignContent: 'center' }}>
          <AuthShowcase />
        </Box>
        <div>
          <Typography
            component="h2"
            sx={(theme) => ({
              fontFamily: theme.studio.fonts.display,
              fontWeight: 600,
              fontSize: 'clamp(30px, 3.4vw, 44px)',
              lineHeight: 1.12,
              maxWidth: '14ch',
            })}
          >
            Monthly marks in. Result cards out.
          </Typography>
          <Typography
            sx={(theme) => ({
              mt: 1.5,
              maxWidth: '40ch',
              color: theme.palette.studio.sidebarInk,
            })}
          >
            Enter a whole class on one grid and print every card in your
            school's format.
          </Typography>
        </div>
      </Box>
    </Box>
  );
}
