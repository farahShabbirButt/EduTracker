import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  InputBase,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import { routes } from '../config/routes';
import { ThemeContext } from '../theme/ThemeContextProvider';
import { useContext, useState } from 'react';

const DRAWER_OPEN = 240;
const DRAWER_CLOSED = 55;

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: routes.portal.dashboard, icon: <DashboardIcon /> },
  { label: 'Students', to: routes.portal.student, icon: <PeopleIcon /> },
  { label: 'Classes', to: routes.portal.classes, icon: <MeetingRoomIcon /> },
  { label: 'Subjects', to: routes.portal.subjects, icon: <BookIcon /> },
  {
    label: 'Monthly Data',
    to: routes.portal.monthlyData,
    icon: <CalendarMonthIcon />,
  },
  { label: 'Reports', to: routes.portal.reports, icon: <DescriptionIcon /> },
  { label: 'Settings', to: routes.portal.settings, icon: <SettingsIcon /> },
];

const PortalLayout = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();

  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    return null;
  }
  const { toogleTheme } = themeContext;

  const toggleMobileDrawer = () => setMobileOpen((p) => !p);
  const toggleSidebar = () => setSidebarOpen((p) => !p);
  const openProfile = (e: React.MouseEvent<HTMLElement>) =>
    setProfileAnchor(e.currentTarget);
  const closeProfile = () => setProfileAnchor(null);

  const drawerContent = (
    <Box
      role="navigation"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Drawer header row with collapse/expand control (desktop only) */}
      <Toolbar
        sx={{ justifyContent: sidebarOpen ? 'space-between' : 'center' }}
      >
        {sidebarOpen && (
          <Typography variant="h6" noWrap>
            EduTracker
          </Typography>
        )}
        {isMdUp && (
          <IconButton
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            size="small"
          >
            {theme.direction === 'rtl' ? (
              sidebarOpen ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )
            ) : sidebarOpen ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const button = (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={active}
              sx={{
                px: 1.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.background.accent,
                  '&:hover': { bgcolor: 'action.selected' },
                },
              }}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 1.5 : 'auto',
                  justifyContent: 'center',
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 'bold' : 'normal',
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  noWrap: true,
                }}
                sx={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: theme.transitions.create('opacity', {
                    duration: theme.transitions.duration.shortest,
                  }),
                }}
              />
            </ListItemButton>
          );

          // When collapsed on desktop, wrap with tooltip so labels show on hover
          return sidebarOpen || !isMdUp ? (
            button
          ) : (
            <Tooltip key={item.to} title={item.label} placement="right">
              <Box>{button}</Box>
            </Tooltip>
          );
        })}
      </List>
      <Divider />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          alignItems: 'center',
        }}
      >
        {sidebarOpen && (
          <Typography variant="caption" color="text.secondary">
            v0.1 • MVP
          </Typography>
        )}
      </Box>
    </Box>
  );

  // computed widths for layout shift
  const desktopDrawerWidth = sidebarOpen ? DRAWER_OPEN : DRAWER_CLOSED;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* HEADER */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Mobile hamburger */}
          {!isMdUp && (
            <IconButton
              edge="start"
              onClick={toggleMobileDrawer}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop sidebar toggle (shows in header too, optional for redundancy) */}
          {isMdUp && (
            <IconButton
              edge="start"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap sx={{ mr: 1 }}>
            EduTracker
          </Typography>

          {/* Search */}
          <Box
            sx={{
              ml: 1,
              flex: 1,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              maxWidth: 480,
            }}
            aria-label="search"
          >
            <SearchIcon fontSize="small" />
            <InputBase
              placeholder="Search students, subjects…"
              inputProps={{ 'aria-label': 'search' }}
              sx={{ ml: 1, width: '100%' }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Notifications">
            <IconButton>
              <Badge color="primary" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={openProfile} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={closeProfile}
          >
            <MenuItem onClick={closeProfile}>Profile</MenuItem>
            <MenuItem
              onClick={() => {
                toogleTheme(isDarkMode ? 'light' : 'dark');
                closeProfile();
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isDarkMode ? (
                  <DarkModeIcon fontSize="small" />
                ) : (
                  <LightModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </MenuItem>

            <MenuItem onClick={closeProfile}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          backgroundColor: 'background.paper',
          '& .MuiDrawer-paper': { width: DRAWER_OPEN },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DESKTOP DRAWER (mini-variant) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: desktopDrawerWidth,
            overflowX: 'hidden',
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          ml: { md: `${desktopDrawerWidth}px` },
          overflow: 'hidden',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Spacer so content starts below fixed AppBar */}
        <Toolbar />

        {/* Scrollable content area */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            overflow: 'auto',
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            background: theme.palette.background.primary,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PortalLayout;
