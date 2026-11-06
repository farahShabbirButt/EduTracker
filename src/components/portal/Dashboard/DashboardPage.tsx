import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Chip,
  Grid,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type { ReactNode } from 'react';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchDashboard } from '../../../redux/slices/dashboardSlice';
import { routes } from '../../../config/routes';
import { MonthList } from '../../../config/constants';
import LoadError from '../../../common/LoadError';
import ProgressBar from '../../../common/ProgressBar';
import { percentOf } from '../../../common/percent';
import EmptyState from '../../../common/EmptyState';
import useCountUp from '../../../common/useCountUp';
import { attentionPath } from '../../../layout/attention';

const RING_LENGTH = 339.3;

const Ring = ({ value }: { value: number }) => {
  const shown = useCountUp(value);
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <Box
      role="img"
      aria-label={`${value} percent of marks entered`}
      sx={{
        position: { xs: 'absolute', sm: 'relative' },
        top: { xs: 18, sm: 'auto' },
        right: { xs: 18, sm: 'auto' },
        width: { xs: 76, sm: 136 },
        height: { xs: 76, sm: 136 },
        flex: 'none',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 120 120"
        sx={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
      >
        <Box
          component="circle"
          cx="60"
          cy="60"
          r="54"
          sx={(theme) => ({
            fill: 'none',
            strokeWidth: 11,
            stroke: theme.palette.studio.sidebarLine,
          })}
        />
        <Box
          component="circle"
          cx="60"
          cy="60"
          r="54"
          sx={(theme) => ({
            fill: 'none',
            strokeWidth: 11,
            strokeLinecap: 'round',
            strokeDasharray: RING_LENGTH,
            stroke: theme.palette.studio.sidebarInkStrong,
            transition: `stroke-dashoffset 1s ${theme.studio.motion.ease}`,
          })}
          style={{ strokeDashoffset: RING_LENGTH * (1 - drawn / 100) }}
        />
      </Box>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: theme.studio.fonts.display,
          fontWeight: 600,
          fontSize: { xs: 20, sm: 34 },
        })}
      >
        {shown}
      </Box>
    </Box>
  );
};

const Stat = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'tint' | 'peach' | 'mint' | 'sky';
}) => {
  const shown = useCountUp(value);
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        p: { xs: 1.75, sm: 2.25 },
        bgcolor: theme.palette.studio[tone],
        borderRadius: `${theme.studio.radii.large}px`,
      })}
    >
      <Box>
        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography
          sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}
        >
          {shown}
        </Typography>
      </Box>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          display: { xs: 'none', sm: 'grid' },
          placeItems: 'center',
          width: 40,
          height: 40,
          color: 'primary.main',
          bgcolor: 'background.paper',
          borderRadius: `${theme.studio.radii.medium}px`,
        })}
      >
        {icon}
      </Box>
    </Box>
  );
};

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { dashboard, loadError } = useSelector(
    (state: RootState) => state.dashboard
  );

  if (loadError) {
    return (
      <LoadError
        message={loadError}
        onRetry={() => dispatch(fetchDashboard())}
      />
    );
  }

  if (!dashboard) {
    return (
      <Stack spacing={2}>
        <Skeleton
          variant="rounded"
          height={200}
          sx={(theme) => ({ borderRadius: `${theme.studio.radii.xlarge}px` })}
        />
        <Skeleton variant="rounded" height={110} />
        <Skeleton variant="rounded" height={260} />
      </Stack>
    );
  }

  const { marks, counts, tests, attention, setup } = dashboard;
  const monthName =
    MonthList.find((m) => m.value === dashboard.month)?.label ?? '';
  const missing = marks.expected - marks.entered;
  const percent = percentOf(marks.entered, marks.expected);
  const nothingDue = tests.length > 0 && marks.expected === 0;

  const steps = [
    { label: 'Add classes', done: setup.classes, to: routes.portal.classes },
    {
      label: 'Add subjects and assign them',
      done: setup.subjects,
      to: routes.portal.subjects,
    },
    { label: 'Add students', done: setup.students, to: routes.portal.student },
    {
      label: 'Set grade boundaries',
      done: setup.gradeBands,
      to: `${routes.portal.subjects}?tab=grades`,
    },
  ];
  const stepsDone = steps.filter((s) => s.done).length;

  return (
    <Stack spacing={2}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3.5,
          p: { xs: 2.75, sm: 4.25 },
          bgcolor: theme.palette.studio.hero,
          color: theme.palette.studio.sidebarInkStrong,
          borderRadius: `${theme.studio.radii.xlarge}px`,
        })}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            sx={(theme) => ({
              pr: { xs: 11, sm: 0 },
              maxWidth: '19ch',
              fontFamily: theme.studio.fonts.display,
              fontWeight: 600,
              fontSize: { xs: 26, md: 38 },
              lineHeight: 1.12,
            })}
          >
            {tests.length === 0
              ? `No tests for ${monthName} yet.`
              : nothingDue
                ? 'No marks are due yet.'
                : missing > 0
                  ? `Marks are ${percent}% entered.`
                  : 'All marks are in.'}
          </Typography>
          <Typography
            sx={(theme) => ({
              mt: 1.25,
              color: theme.palette.studio.sidebarInk,
            })}
          >
            {tests.length === 0
              ? "Create this month's test to start entering marks."
              : nothingDue
                ? "This month's tests have no students or subjects yet."
                : missing > 0
                  ? `${missing} ${missing === 1 ? 'mark' : 'marks'} left before every result card can be printed.`
                  : "Every card for this month's tests is ready to print."}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  tests.length ? routes.portal.marks : routes.portal.tests
                )
              }
              sx={(theme) => ({
                bgcolor: theme.palette.studio.paper,
                color: theme.palette.studio.paperAccent,
                '&:hover': { bgcolor: theme.palette.studio.paperLine },
              })}
            >
              {tests.length ? 'Enter marks' : 'Add a test'}
            </Button>
            <Button
              variant="text"
              onClick={() => navigate(routes.portal.reports)}
              sx={(theme) => ({
                color: 'inherit',
                border: `1px solid ${theme.palette.studio.sidebarInk}`,
                '&:hover': {
                  bgcolor: theme.palette.studio.sidebarHover,
                },
              })}
            >
              Print reports
            </Button>
          </Stack>
        </Box>
        {tests.length > 0 && !nothingDue && <Ring value={percent} />}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.75,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <Stat
          label="Students"
          value={counts.students}
          icon={<PeopleOutlineOutlinedIcon />}
          tone="tint"
        />
        <Stat
          label="Classes"
          value={counts.classes}
          icon={<LayersOutlinedIcon />}
          tone="peach"
        />
        <Stat
          label="Subjects"
          value={counts.subjects}
          icon={<MenuBookOutlinedIcon />}
          tone="mint"
        />
        <Stat
          label="Tests this month"
          value={counts.testsThisMonth}
          icon={<AssignmentTurnedInOutlinedIcon />}
          tone="sky"
        />
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 2.75 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h5" component="h2">
                This month's marks entry
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(routes.portal.tests)}
              >
                All tests
              </Button>
            </Box>
            {tests.length === 0 ? (
              <EmptyState
                title="Nothing to enter yet"
                detail="Tests you add for this month appear here."
              />
            ) : (
              tests.map((test, index) => {
                const left = test.expected - test.entered;
                const done = percentOf(test.entered, test.expected);
                return (
                  <Box
                    key={test.externalId}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr) auto',
                        sm: 'minmax(0, 1fr) 150px auto',
                      },
                      gap: 2,
                      alignItems: 'center',
                      py: 1.5,
                      borderTop: index ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 700 }}>
                        {test.name}, {test.class.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.hint' }}>
                        {test.expected === 0
                          ? 'No marks due'
                          : left > 0
                            ? `${left} ${left === 1 ? 'mark' : 'marks'} missing`
                            : 'Complete'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        gridRow: { xs: 2, sm: 'auto' },
                        gridColumn: { xs: '1 / -1', sm: 'auto' },
                      }}
                    >
                      <ProgressBar
                        value={done}
                        label={`${test.name}, ${test.class.name}`}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(
                          `${routes.portal.marks}?class=${test.class.externalId}&test=${test.externalId}`
                        )
                      }
                    >
                      {left > 0 ? 'Continue' : 'Open'}
                    </Button>
                  </Box>
                );
              })
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <Card sx={{ p: 2.75 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                Needs attention
              </Typography>
              {attention.length === 0 ? (
                <Typography variant="body2">
                  Nothing needs your attention.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {attention.map((item, index) => (
                    <ButtonBase
                      key={index}
                      onClick={() => navigate(attentionPath(item))}
                      sx={(theme) => ({
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        p: 1.5,
                        textAlign: 'left',
                        color: theme.palette.studio.amberInk,
                        bgcolor: theme.palette.studio.amberSoft,
                        borderRadius: `${theme.studio.radii.medium}px`,
                        '&:active': {
                          transform: `scale(${theme.studio.motion.pressScale})`,
                        },
                      })}
                    >
                      <WarningAmberOutlinedIcon fontSize="small" />
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="inherit">
                          {item.detail}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  ))}
                </Stack>
              )}
            </Card>
            {stepsDone < steps.length && (
              <Card sx={{ p: 2.75 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="h5" component="h2">
                    Setup guide
                  </Typography>
                  <Chip
                    size="small"
                    label={`${stepsDone} of ${steps.length}`}
                    sx={(theme) => ({
                      bgcolor: theme.palette.studio.greenSoft,
                      color: theme.palette.studio.greenInk,
                    })}
                  />
                </Box>
                {steps.map((step) => (
                  <Box
                    key={step.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      minHeight: 40,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        flex: 'none',
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        bgcolor: step.done ? 'primary.main' : 'transparent',
                        border: step.done ? 0 : 2,
                        borderColor: 'divider',
                        color: 'primary.contrastText',
                      }}
                    >
                      {step.done && <CheckIcon sx={{ fontSize: 15 }} />}
                    </Box>
                    {step.done ? (
                      <Typography sx={{ fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                    ) : (
                      <Link component={RouterLink} to={step.to}>
                        {step.label}
                      </Link>
                    )}
                  </Box>
                ))}
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
