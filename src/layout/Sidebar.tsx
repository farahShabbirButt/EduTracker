import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import type { RootState } from '../redux/store';
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from '../utils/localStorageMethods';
import { routes } from '../config/routes';
import { isActive, navGroups } from './navigation';

const WIDTH_OPEN = 256;
const WIDTH_CLOSED = 76;
const ITEM_HEIGHT = 44;
const ITEM_GAP = 2;
const GROUP_OPEN = 34;
const GROUP_CLOSED = 14;
const COLLAPSED_KEY = 'sidebarCollapsed';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const school = useSelector((state: RootState) => state.institute.institute);
  const [collapsed, setCollapsed] = useState(
    () => readFromLocalStorage(COLLAPSED_KEY) === true
  );

  // On a short screen the list scrolls, so keep the current page in view
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [pathname]);

  const toggle = () => {
    setCollapsed((was) => {
      writeToLocalStorage(COLLAPSED_KEY, !was);
      return !was;
    });
  };

  // The highlight's place comes from the layout's own sizes, so it can slide
  // to its target before the items finish moving.
  let y = 0;
  let pillY: number | null = null;
  navGroups.forEach((group) => {
    y += collapsed ? GROUP_CLOSED : GROUP_OPEN;
    group.items.forEach((item) => {
      y += ITEM_GAP;
      if (isActive(pathname, item.to)) pillY = y;
      y += ITEM_HEIGHT;
    });
  });

  return (
    <Box
      component="aside"
      aria-label="Main"
      sx={(theme) => ({
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'sticky',
        top: 16,
        flex: 'none',
        height: 'calc(100vh - 32px)',
        width: collapsed ? WIDTH_CLOSED : WIDTH_OPEN,
        px: 1.5,
        py: 2,
        overflow: 'hidden',
        color: theme.palette.studio.sidebarInk,
        bgcolor: theme.palette.studio.sidebar,
        borderRadius: `${theme.studio.radii.xlarge}px`,
        boxShadow: theme.studio.shadows.medium,
        '& .MuiButtonBase-root.Mui-focusVisible': {
          outlineColor: theme.palette.studio.sidebarInkStrong,
        },
        transition: `width ${theme.studio.motion.slow} ${theme.studio.motion.ease}, background-color ${theme.studio.motion.medium}`,
      })}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          height: 44,
          pl: 0.75,
          flex: 'none',
          color: theme.palette.studio.sidebarInkStrong,
        })}
      >
        <Box
          sx={(theme) => ({
            width: 36,
            height: 36,
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            borderRadius: `${theme.studio.radii.small}px`,
            bgcolor: theme.palette.studio.sidebarInkStrong,
            color: theme.palette.studio.pillInk,
          })}
        >
          <SchoolOutlinedIcon fontSize="small" />
        </Box>
        <Fade collapsed={collapsed}>
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
            EduTracker
          </Typography>
        </Fade>
      </Box>

      <ButtonBase
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        sx={(theme) => ({
          flex: 'none',
          justifyContent: 'flex-start',
          gap: 1.5,
          height: 36,
          mt: 1,
          pl: 2,
          color: 'inherit',
          fontSize: 13,
          fontWeight: 600,
          borderRadius: `${theme.studio.radii.small}px`,
          transition: `background-color ${theme.studio.motion.medium}`,
          '&:hover': {
            bgcolor: theme.palette.studio.sidebarHover,
            color: theme.palette.studio.sidebarInkStrong,
          },
          '& svg': {
            fontSize: 18,
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: `transform ${theme.studio.motion.slow} ${theme.studio.motion.ease}`,
          },
        })}
      >
        <ChevronLeftIcon />
        <Fade collapsed={collapsed}>Collapse</Fade>
      </ButtonBase>

      <Box
        component="nav"
        ref={navRef}
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.studio.sidebarLine} transparent`,
          pb: 1,
        })}
      >
        <Box
          aria-hidden="true"
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: ITEM_HEIGHT,
            bgcolor: theme.palette.studio.pill,
            borderRadius: `${theme.studio.radii.medium}px`,
            opacity: pillY === null ? 0 : 1,
            transition: `transform ${theme.studio.motion.slow} ${theme.studio.motion.spring}, opacity ${theme.studio.motion.medium}`,
          })}
          style={{ transform: `translateY(${pillY ?? 0}px)` }}
        />
        {navGroups.map((group) => (
          <Box key={group.label}>
            <Box
              sx={(theme) => ({
                position: 'relative',
                height: collapsed ? GROUP_CLOSED : GROUP_OPEN,
                pt: collapsed ? 0 : 1.5,
                pl: 2,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                opacity: collapsed ? 0 : 0.72,
                transition: `height ${theme.studio.motion.slow} ${theme.studio.motion.ease}, opacity ${theme.studio.motion.medium}`,
              })}
            >
              {group.label}
            </Box>
            {group.items.map((item) => {
              const active = isActive(pathname, item.to);
              const link = (
                <ButtonBase
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  sx={(theme) => ({
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: ITEM_HEIGHT,
                    mt: `${ITEM_GAP}px`,
                    pl: 2,
                    gap: 1.5,
                    justifyContent: 'flex-start',
                    color: active ? theme.palette.studio.pillInk : 'inherit',
                    fontWeight: active ? 700 : 600,
                    fontSize: 14.5,
                    borderRadius: `${theme.studio.radii.medium}px`,
                    transition: `color ${theme.studio.motion.medium}, background-color ${theme.studio.motion.medium}, transform ${theme.studio.motion.fast} ${theme.studio.motion.ease}`,
                    '&:hover': active
                      ? undefined
                      : {
                          bgcolor: theme.palette.studio.sidebarHover,
                          color: theme.palette.studio.sidebarInkStrong,
                        },
                    '&:active': {
                      transform: `scale(${theme.studio.motion.pressScale})`,
                    },
                    '&.Mui-focusVisible': { outlineOffset: -2 },
                    '& svg': { fontSize: 21 },
                  })}
                >
                  {item.icon}
                  <Fade collapsed={collapsed}>{item.label}</Fade>
                </ButtonBase>
              );
              return collapsed ? (
                <Tooltip key={item.to} title={item.label} placement="right">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </Box>
        ))}
      </Box>

      <ButtonBase
        onClick={() => navigate(routes.portal.profile)}
        aria-label={collapsed ? 'Your profile' : undefined}
        sx={(theme) => ({
          flex: 'none',
          justifyContent: 'flex-start',
          gap: 1.25,
          mt: 1,
          px: 1,
          py: 1.25,
          color: theme.palette.studio.sidebarInkStrong,
          textAlign: 'left',
          borderTop: `1px solid ${theme.palette.studio.sidebarLine}`,
          '&:hover': { bgcolor: theme.palette.studio.sidebarHover },
        })}
      >
        <Avatar
          src={school?.logo ?? undefined}
          alt=""
          sx={(theme) => ({
            width: 38,
            height: 38,
            fontSize: 13,
            fontWeight: 800,
            color: 'inherit',
            bgcolor: school?.logo
              ? theme.palette.studio.paper
              : theme.palette.studio.sidebarHover,
            '& img': { objectFit: 'contain' },
          })}
        >
          {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
        </Avatar>
        <Fade collapsed={collapsed}>
          <Box sx={{ minWidth: 0, width: 170 }}>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 700 }}>
              {school?.name ?? 'Your school'}
            </Typography>
            <Typography noWrap sx={{ fontSize: 12, opacity: 0.8 }}>
              School admin
            </Typography>
          </Box>
        </Fade>
      </ButtonBase>
    </Box>
  );
};

// Text stays in place and fades, so nothing jumps while the width animates
const Fade = ({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) => (
  <Box
    component="span"
    aria-hidden={collapsed || undefined}
    sx={(theme) => ({
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      transform: collapsed ? 'translateX(-8px)' : 'none',
      transition: `opacity ${theme.studio.motion.medium}, transform ${theme.studio.motion.medium}`,
    })}
  >
    {children}
  </Box>
);

export default Sidebar;
