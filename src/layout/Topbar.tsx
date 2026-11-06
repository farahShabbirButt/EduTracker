import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  createFilterOptions,
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { routes } from '../config/routes';
import { ThemeContext } from '../theme/ThemeContextProvider';
import type { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { fetchStudents } from '../redux/slices/studentSlice';
import type { Student } from '../components/portal/Students/@types/student.d';
import { navItemFor } from './navigation';
import { useNavigationGuard } from './NavigationGuard';

const firstMatches = createFilterOptions<Student>({ limit: 8 });

const Topbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { confirmLeaving } = useNavigationGuard();
  const themeContext = useContext(ThemeContext);
  const user = useSelector((state: RootState) => state.auth.user);
  const students = useSelector((state: RootState) => state.students.students);

  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const current = navItemFor(pathname);

  const go = (to: string) => {
    setAccountAnchor(null);
    navigate(to);
  };

  const handleLogout = () => {
    setAccountAnchor(null);
    confirmLeaving(async () => {
      await dispatch(logout());
      navigate(routes.auth.login, { replace: true });
    });
  };

  const isDark = themeContext?.isDarkMode ?? false;

  return (
    <Box
      component="header"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 60 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="h1"
          noWrap
          sx={{
            fontSize: { xs: 23, md: 27 },
            fontWeight: 800,
            letterSpacing: '-.02em',
            lineHeight: 1.2,
          }}
        >
          {current?.label}
        </Typography>
        <Typography variant="body2" noWrap sx={{ color: 'text.hint' }}>
          {current?.subtitle}
        </Typography>
      </Box>

      <Autocomplete
        size="small"
        sx={{ width: 280, display: { xs: 'none', lg: 'block' } }}
        options={students}
        autoHighlight
        forcePopupIcon={false}
        blurOnSelect
        clearOnBlur
        value={null}
        filterOptions={firstMatches}
        onFocus={() => {
          if (students.length === 0) dispatch(fetchStudents());
        }}
        getOptionLabel={(s) =>
          `${[s.firstName, s.lastName].filter(Boolean).join(' ')}, roll ${s.rollNumber}, ${s.class?.name ?? 'no class'}`
        }
        getOptionKey={(s) => s.externalId}
        noOptionsText="No student found"
        onChange={(_, student) => {
          if (student) {
            go(`${routes.portal.student}?student=${student.externalId}`);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Find a student"
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                'aria-label': 'Find a student',
              },
              input: {
                ...params.InputProps,
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ ml: 0.5, color: 'text.hint' }}
                  />
                ),
                sx: (theme) => ({
                  borderRadius: `${theme.studio.radii.pill}px`,
                }),
              },
            }}
          />
        )}
      />

      <Tooltip title={isDark ? 'Use light theme' : 'Use dark theme'}>
        <IconButton
          aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
          onClick={() => themeContext?.toogleTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={user?.email ?? 'Your account'}>
        <IconButton
          aria-label="Your account"
          onClick={(e) => setAccountAnchor(e.currentTarget)}
        >
          <Avatar
            sx={(theme) => ({
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 800,
              bgcolor: 'background.accent',
              color: theme.palette.studio.tintInk,
            })}
          >
            {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
      >
        <MenuItem onClick={() => go(routes.portal.profile)}>
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Your profile
        </MenuItem>
        <MenuItem onClick={() => go(routes.portal.settings)}>
          <ListItemIcon>
            <TuneOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Topbar;
