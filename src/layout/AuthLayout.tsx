import { Box, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { appInfo } from '../config/appInfo';
import { routes } from '../config/routes';

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
          display: 'grid',
          alignContent: 'center',
          justifyItems: 'center',
          p: { xs: 3, md: 5 },
        }}
      >
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
          justifyContent: 'flex-end',
          m: 2,
          p: 6,
          borderRadius: `${theme.studio.radii.xlarge}px`,
          bgcolor: theme.palette.studio.hero,
          color: theme.palette.studio.sidebarInkStrong,
        })}
      >
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
          Enter a whole class on one grid and print every card in your school's
          format.
        </Typography>
      </Box>
    </Box>
  );
}
