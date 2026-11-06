import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';
import { Box, ButtonBase, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
              left: 12,
              right: 12,
              bottom: 12,
              p: 2,
              borderRadius: `${theme.studio.radii.large}px`,
            }),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Typography variant="h5" component="h2">
            More
          </Typography>
          <IconButton aria-label="Close" onClick={() => setMoreOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          component="nav"
          aria-label="More"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
        >
          {moreItems.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <ButtonBase
                key={item.to}
                onClick={() => go(item.to)}
                aria-current={active ? 'page' : undefined}
                sx={(theme) => ({
                  justifyContent: 'flex-start',
                  gap: 1.25,
                  p: 1.25,
                  textAlign: 'start',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: `${theme.studio.radii.medium}px`,
                  color: active ? theme.palette.studio.tintInk : 'text.primary',
                  bgcolor: active
                    ? theme.palette.studio.tint
                    : theme.palette.studio.surfaceSoft,
                  '&:active': {
                    transform: `scale(${theme.studio.motion.pressScale})`,
                  },
                })}
              >
                <Box
                  sx={(theme) => ({
                    flex: 'none',
                    width: 36,
                    height: 36,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: `${theme.studio.radii.small}px`,
                    color: theme.palette.studio.tintInk,
                    bgcolor: active
                      ? theme.palette.studio.surface
                      : theme.palette.studio.tint,
                    '& svg': { fontSize: 20 },
                  })}
                >
                  {item.icon}
                </Box>
                {item.label}
              </ButtonBase>
            );
          })}
        </Box>
      </Drawer>
    </>
  );
};

export default BottomTabs;
