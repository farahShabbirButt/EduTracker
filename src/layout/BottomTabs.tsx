import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';
import {
  Box,
  ButtonBase,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { isActive, moreItems, tabItems } from './navigation';

const TABS = tabItems.length + 1;

const BottomTabs = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const found = tabItems.findIndex((item) => isActive(pathname, item.to));
  const activeIndex = found >= 0 ? found : tabItems.length;

  const go = (to: string) => {
    setMoreOpen(false);
    navigate(to);
  };

  const tabSx = (active: boolean) => (theme: Theme) => ({
    position: 'relative',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: 0.25,
    minHeight: 52,
    fontSize: 11.5,
    fontWeight: 700,
    color: active ? 'var(--tab-active)' : 'inherit',
    '& svg': { fontSize: 21 },
    '&:active': { transform: `scale(${theme.studio.motion.pressScale})` },
    '&.Mui-focusVisible': {
      outlineColor: theme.palette.studio.sidebarInkStrong,
    },
  });

  return (
    <>
      <Box
        component="nav"
        aria-label="Main"
        sx={(theme) => ({
          '--tab-active': theme.palette.studio.pillInk,
          display: { xs: 'grid', md: 'none' },
          gridTemplateColumns: `repeat(${TABS}, 1fr)`,
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: theme.zIndex.appBar,
          p: 0.75,
          color: theme.palette.studio.sidebarInk,
          bgcolor: theme.palette.studio.sidebar,
          borderRadius: `${theme.studio.radii.large}px`,
          boxShadow: theme.studio.shadows.large,
        })}
      >
        <Box
          aria-hidden="true"
          sx={(theme) => ({
            position: 'absolute',
            top: 6,
            bottom: 6,
            left: 6,
            width: `calc((100% - 12px) / ${TABS})`,
            bgcolor: theme.palette.studio.pill,
            borderRadius: `${theme.studio.radii.medium}px`,
            transition: `transform ${theme.studio.motion.slow} ${theme.studio.motion.spring}`,
          })}
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {tabItems.map((item, index) => (
          <ButtonBase
            key={item.to}
            onClick={() => go(item.to)}
            aria-current={index === activeIndex ? 'page' : undefined}
            sx={tabSx(index === activeIndex)}
          >
            {item.icon}
            {item.short ?? item.label}
          </ButtonBase>
        ))}
        <ButtonBase
          onClick={() => setMoreOpen(true)}
          aria-current={activeIndex === tabItems.length ? 'page' : undefined}
          sx={tabSx(activeIndex === tabItems.length)}
        >
          <MoreHorizIcon />
          More
        </ButtonBase>
      </Box>

      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        slotProps={{
          paper: {
            sx: (theme) => ({
              borderRadius: `${theme.studio.radii.large}px ${theme.studio.radii.large}px 0 0`,
              pb: 2,
            }),
          },
        }}
      >
        <List aria-label="More">
          {moreItems.map((item) => (
            <ListItemButton key={item.to} onClick={() => go(item.to)}>
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default BottomTabs;
