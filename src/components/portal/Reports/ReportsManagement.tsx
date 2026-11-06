import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import {
  clearCards,
  fetchCards,
  retryFailedCards,
} from '../../../redux/slices/reportSlice';
import { MonthList } from '../../../config/constants';
import EmptyState from '../../../common/EmptyState';
import LoadError from '../../../common/LoadError';
import ReportPreviewModal from './Partials/ReportPreviewModal';
import { ResultCard } from './ResultCard';
import type { IReportCard, IReportPeriod } from './@types/reportCard.d';

// Next year is here because a school year can end in it
const yearOptions = () =>
  Array.from({ length: 16 }, (_, i) => new Date().getFullYear() + 1 - i);

// The school year running today
const schoolYearPeriod = (startMonth: number) => {
  const today = new Date();
  const year = today.getFullYear();
  const fromYear = today.getMonth() + 1 >= startMonth ? year : year - 1;

  return {
    fromMonth: startMonth,
    fromYear,
    toMonth: startMonth === 1 ? 12 : startMonth - 1,
    toYear: startMonth === 1 ? fromYear : fromYear + 1,
  };
};

const cardSummary = (card: IReportCard) => {
  const { percentage, grade } = card.overall;
  const parts = [`Roll ${card.student.rollNumber}`];
  if (percentage !== null) parts.push(`${percentage.toFixed(2)}%`);
  if (grade) parts.push(`grade ${grade}`);
  if (card.position) parts.push(`position ${card.position.rank}`);
  return parts.join(', ');
};

const ReportsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const startDate = useSelector(
    (state: RootState) => state.institute.institute?.schoolYearStartDate
  );
  const classes = useSelector((state: RootState) => state.classes.classes);
  const students = useSelector((state: RootState) => state.students.students);
  const { cards, failed } = useSelector((state: RootState) => state.report);

  const startMonth = startDate ? Number(startDate.slice(5, 7)) : 1;
  const [period, setPeriod] = useState(() => schoolYearPeriod(startMonth));
  const periodPicked = useRef(false);
  const [classId, setClassId] = useState('');
  // Unticked students. Everyone counts as picked until then, so a class chosen
  // before its students have loaded still selects all of them.
  const [unticked, setUnticked] = useState<string[]>([]);
  const [preview, setPreview] = useState<IReportCard | null>(null);
  const [printing, setPrinting] = useState<IReportCard[]>([]);
  const printRef = useRef<HTMLDivElement | null>(null);

  const print = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Result Cards',
    onAfterPrint: () => setPrinting([]),
  });

  useEffect(() => {
    if (printing.length > 0) print();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printing]);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
    return () => {
      dispatch(clearCards());
    };
  }, [dispatch]);

  // A slow load mustn't replace a period already picked
  useEffect(() => {
    if (!periodPicked.current) setPeriod(schoolYearPeriod(startMonth));
  }, [startMonth]);

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.class?.externalId === classId)
        .sort((a, b) =>
          a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
        ),
    [students, classId]
  );

  const pickClass = (id: string) => {
    setClassId(id);
    setUnticked([]);
  };

  const setPeriodField = (field: keyof typeof period, value: number) => {
    periodPicked.current = true;
    setPeriod((was) => ({ ...was, [field]: value }));
  };

  const periodValid =
    period.fromYear * 12 + period.fromMonth <=
    period.toYear * 12 + period.toMonth;

  const reportPeriod: IReportPeriod = useMemo(
    () => ({
      from: { month: period.fromMonth, year: period.fromYear },
      to: { month: period.toMonth, year: period.toYear },
    }),
    [period]
  );

  // Register order, whatever order they were ticked
  const ordered = useMemo(
    () =>
      classStudents
        .filter((s) => !unticked.includes(s.externalId))
        .map((s) => s.externalId),
    [classStudents, unticked]
  );

  // Another period means different cards
  useEffect(() => {
    dispatch(clearCards());
  }, [dispatch, reportPeriod]);

  // Only what isn't loaded yet, so ticking a box doesn't reload the class. Joined
  // into a string so a reloaded student list with the same people changes nothing.
  const toLoad = ordered
    .filter((id) => !cards[id] && !failed.includes(id))
    .join();

  useEffect(() => {
    if (!toLoad || !periodValid) return undefined;
    const request = dispatch(
      fetchCards({
        studentExternalIds: toLoad.split(','),
        period: reportPeriod,
      })
    );
    return () => request.abort();
  }, [dispatch, toLoad, reportPeriod, periodValid]);

  const shown = ordered.flatMap((id) =>
    cards[id] ? [{ id, card: cards[id] }] : []
  );
  const printable = shown.filter(({ card }) => card.rows.length > 0);
  const ready = printable.filter(({ card }) => card.missingMarks.length === 0);
  const failedCount = ordered.filter((id) => failed.includes(id)).length;
  const pending = periodValid ? ordered.length - shown.length - failedCount : 0;

  const handlePrintAll = () => {
    const skipped = shown.length - printable.length;
    const incomplete = printable.length - ready.length;

    if (skipped > 0) {
      toast.warning(`${skipped} student(s) have no tests in this period`);
    }
    if (incomplete > 0) {
      toast.warning(`${incomplete} card(s) have marks not entered`);
    }
    if (printable.some(({ card }) => card.position?.provisional)) {
      toast.warning(
        'Positions may change: some students still have marks to enter'
      );
    }
    setPrinting(printable.map(({ card }) => card));
  };

  const yearField = (label: string, field: 'fromYear' | 'toYear') => (
    <TextField
      select
      fullWidth
      label={label}
      value={period[field]}
      onChange={(e) => setPeriodField(field, Number(e.target.value))}
    >
      {yearOptions().map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </TextField>
  );

  const monthField = (label: string, field: 'fromMonth' | 'toMonth') => (
    <TextField
      select
      fullWidth
      label={label}
      value={period[field]}
      onChange={(e) => setPeriodField(field, Number(e.target.value))}
    >
      {MonthList.map((m) => (
        <MenuItem key={m.value} value={m.value}>
          {m.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ p: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Report settings
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25}>
              {monthField('From month', 'fromMonth')}
              {yearField('From year', 'fromYear')}
            </Stack>
            <Stack direction="row" spacing={1.25}>
              {monthField('To month', 'toMonth')}
              {yearField('To year', 'toYear')}
            </Stack>
            {!periodValid && (
              <Alert severity="warning">
                The To month can't be before the From month.
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Class"
              value={classId}
              onChange={(e) => pickClass(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.externalId} value={c.externalId}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            {classId && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Students
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setUnticked(
                        ordered.length
                          ? classStudents.map((s) => s.externalId)
                          : []
                      )
                    }
                  >
                    {ordered.length ? 'Clear all' : 'Select all'}
                  </Button>
                </Box>
                <Stack>
                  {classStudents.map((student) => (
                    <FormControlLabel
                      key={student.externalId}
                      label={[student.firstName, student.lastName]
                        .filter(Boolean)
                        .join(' ')}
                      control={
                        <Checkbox
                          checked={ordered.includes(student.externalId)}
                          onChange={(e) =>
                            setUnticked((was) =>
                              e.target.checked
                                ? was.filter((id) => id !== student.externalId)
                                : [...was, student.externalId]
                            )
                          }
                        />
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h5" component="h2">
                {ordered.length} result{' '}
                {ordered.length === 1 ? 'card' : 'cards'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.hint' }}>
                {pending > 0
                  ? `Preparing ${shown.length + failedCount + 1} of ${ordered.length}`
                  : `${ready.length} ready to print`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={
                pending > 0 ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PrintOutlinedIcon />
                )
              }
              onClick={handlePrintAll}
              disabled={pending > 0 || printable.length === 0}
            >
              Print all
            </Button>
          </Box>

          {failedCount > 0 && pending === 0 && (
            <Box sx={{ mb: 1 }}>
              <LoadError
                message={`${failedCount} ${failedCount === 1 ? 'card' : 'cards'} could not load`}
                onRetry={() => dispatch(retryFailedCards())}
              />
            </Box>
          )}

          {shown.map(({ id, card }, index) => {
            const hasTests = card.rows.length > 0;
            return (
              <Box
                key={id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  py: 1.25,
                  borderTop: index ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    width: 38,
                    height: 38,
                    fontSize: 13,
                    fontWeight: 800,
                    bgcolor: 'background.accent',
                    color: theme.palette.studio.tintInk,
                  })}
                >
                  {card.student.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700 }}>
                    {card.student.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ color: 'text.hint' }}
                  >
                    {cardSummary(card)}
                  </Typography>
                </Box>
                {!hasTests ? (
                  <Chip size="small" label="No tests" />
                ) : (
                  card.missingMarks.length > 0 && (
                    <Chip
                      size="small"
                      label="Marks missing"
                      sx={(theme) => ({
                        display: { xs: 'none', sm: 'inline-flex' },
                        bgcolor: theme.palette.studio.amberSoft,
                        color: theme.palette.studio.amberInk,
                      })}
                    />
                  )
                )}
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!hasTests}
                  aria-label={`Preview ${card.student.name}`}
                  onClick={() => setPreview(card)}
                >
                  Preview
                </Button>
              </Box>
            );
          })}

          {Array.from({ length: pending }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ my: 1 }} />
          ))}

          {ordered.length === 0 && (
            <EmptyState
              title={
                !classId
                  ? 'Choose a class'
                  : classStudents.length === 0
                    ? 'No students in this class'
                    : 'No students selected'
              }
              detail={
                !classId
                  ? "Every student's card appears here, ready to preview and print."
                  : classStudents.length === 0
                    ? 'Add students to this class first.'
                    : 'Tick the students you want cards for.'
              }
            />
          )}
        </Card>
      </Grid>

      {/* Only ever printed, never shown */}
      <Box sx={{ display: 'none' }}>
        <div ref={printRef}>
          {printing.map((card) => (
            <div className="page" key={card.student.rollNumber}>
              <ResultCard data={card} />
            </div>
          ))}
        </div>
      </Box>

      {preview && (
        <ReportPreviewModal card={preview} onClose={() => setPreview(null)} />
      )}
    </Grid>
  );
};

export default ReportsManagement;
