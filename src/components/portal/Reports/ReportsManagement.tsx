import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import { fetchTests } from '../../../redux/slices/testSlice';
import {
  clearCards,
  fetchCards,
  retryFailedCards,
} from '../../../redux/slices/reportSlice';
import { MonthList } from '../../../config/constants';
import EmptyState from '../../../common/EmptyState';
import LabeledSelect from '../../../common/Form/LabeledSelect';
import StudentAvatar from '../../../common/StudentAvatar';
import LoadError from '../../../common/LoadError';
import { dayLabel } from '../../../common/testWhen';
import ReportPreviewModal from './Partials/ReportPreviewModal';
import { ResultCard } from './ResultCard';
import type {
  IReportCard,
  IReportPeriod,
  IReportRequest,
} from './@types/reportCard.d';
import type { ApiTest } from '../MonthlyData/@types/testData.d';

type SessionRange = {
  schoolYear?: number;
  from: string;
  to: string;
  // Earlier tests of the school year, added up as the card's first row
  earlierAsRow: boolean;
};
const NO_RANGE: SessionRange = { from: '', to: '', earlierAsRow: false };

// The rows a card has room for, as in ResultCard
const CARD_ROWS = 12;

// The school year a session test falls in, named by the year it starts
const schoolYearOf = (testDate: string, startMonth: number) => {
  const year = Number(testDate.slice(0, 4));
  return Number(testDate.slice(5, 7)) >= startMonth ? year : year - 1;
};

const schoolYearLabel = (startYear: number, startMonth: number) =>
  startMonth === 1 ? String(startYear) : `${startYear}–${startYear + 1}`;

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
  const allTests = useSelector((state: RootState) => state.tests.tests);
  const [searchParams, setSearchParams] = useSearchParams();
  // A card is one or the other, never both
  const mode: IReportRequest['mode'] =
    searchParams.get('type') === 'session' ? 'SESSION' : 'MONTHLY';

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
    dispatch(fetchTests());
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
    setSession(NO_RANGE);
  };

  // Session tests: the class's, in the order they were sat, by school year
  const sessionTests = useMemo(
    () =>
      allTests
        .filter(
          (t): t is ApiTest & { testDate: string } =>
            t.testType === 'SESSION' &&
            t.class?.externalId === classId &&
            !!t.testDate
        )
        // The list comes newest first; same-day tests keep their order
        .reverse()
        .sort((a, b) => a.testDate.localeCompare(b.testDate)),
    [allTests, classId]
  );
  const schoolYears = useMemo(
    () => [
      ...new Set(sessionTests.map((t) => schoolYearOf(t.testDate, startMonth))),
    ],
    [sessionTests, startMonth]
  );

  const [session, setSession] = useState(NO_RANGE);
  // Until picked, the latest school year and all of its tests
  const schoolYear = session.schoolYear ?? schoolYears[schoolYears.length - 1];
  const yearTests = sessionTests.filter(
    (t) => schoolYearOf(t.testDate, startMonth) === schoolYear
  );
  const fromAt = Math.max(
    0,
    yearTests.findIndex((t) => t.externalId === session.from)
  );
  const toAt = session.to
    ? yearTests.findIndex((t) => t.externalId === session.to)
    : yearTests.length - 1;
  const rangeValid = yearTests.length > 0 && toAt >= fromAt;
  const hasEarlier = fromAt > 0;
  const earlierAsRow = session.earlierAsRow && hasEarlier;
  const rowsNeeded = toAt - fromAt + 1 + (earlierAsRow ? 1 : 0);

  const setRange = (change: Partial<SessionRange>) =>
    setSession((was) => ({ ...was, ...change }));

  const pickMode = (next: IReportRequest['mode']) =>
    setSearchParams(next === 'SESSION' ? { type: 'session' } : {}, {
      replace: true,
    });

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

  const fromTestId = yearTests[fromAt]?.externalId;
  const toTestId = yearTests[toAt]?.externalId;
  const request: IReportRequest | null = useMemo(() => {
    if (mode === 'MONTHLY') {
      return periodValid ? { mode, period: reportPeriod } : null;
    }
    return rangeValid && fromTestId && toTestId
      ? {
          mode,
          fromTestExternalId: fromTestId,
          toTestExternalId: toTestId,
          earlierAsRow,
        }
      : null;
  }, [
    mode,
    periodValid,
    reportPeriod,
    rangeValid,
    fromTestId,
    toTestId,
    earlierAsRow,
  ]);

  // Register order, whatever order they were ticked
  const ordered = useMemo(
    () =>
      classStudents
        .filter((s) => !unticked.includes(s.externalId))
        .map((s) => s.externalId),
    [classStudents, unticked]
  );

  // Another period or range means different cards
  useEffect(() => {
    dispatch(clearCards());
  }, [dispatch, request]);

  // Only what isn't loaded yet, so ticking a box doesn't reload the class. Joined
  // into a string so a reloaded student list with the same people changes nothing.
  const toLoad = ordered
    .filter((id) => !cards[id] && !failed.includes(id))
    .join();

  useEffect(() => {
    if (!toLoad || !request) return undefined;
    const loading = dispatch(
      fetchCards({ studentExternalIds: toLoad.split(','), request })
    );
    return () => loading.abort();
  }, [dispatch, toLoad, request]);

  const shown = ordered.flatMap((id) =>
    cards[id] ? [{ id, card: cards[id] }] : []
  );
  const printable = shown.filter(({ card }) => card.rows.length > 0);
  const ready = printable.filter(({ card }) => card.missingMarks.length === 0);
  const failedCount = ordered.filter((id) => failed.includes(id)).length;
  const pending = request ? ordered.length - shown.length - failedCount : 0;

  const handlePrintAll = () => {
    const skipped = shown.length - printable.length;
    const incomplete = printable.length - ready.length;

    if (skipped > 0) {
      toast.warning(
        `${skipped} student(s) have no tests in this ${mode === 'SESSION' ? 'range' : 'period'}`
      );
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
    <LabeledSelect
      label={label}
      value={period[field]}
      minWidth={0}
      fill
      onChange={(value) => setPeriodField(field, Number(value))}
    >
      {yearOptions().map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </LabeledSelect>
  );

  const monthField = (label: string, field: 'fromMonth' | 'toMonth') => (
    <LabeledSelect
      label={label}
      value={period[field]}
      minWidth={0}
      fill
      options={Object.fromEntries(MonthList.map((m) => [m.value, m.label]))}
      onChange={(value) => setPeriodField(field, Number(value))}
    >
      {MonthList.map((m) => (
        <MenuItem key={m.value} value={m.value}>
          {m.label}
        </MenuItem>
      ))}
    </LabeledSelect>
  );

  const testField = (
    label: string,
    value: string | undefined,
    end: 'from' | 'to'
  ) => (
    <LabeledSelect
      label={label}
      fill
      minWidth={0}
      placeholder="No session tests"
      disabled={yearTests.length === 0}
      value={value ?? ''}
      options={Object.fromEntries(
        yearTests.map((t) => [
          t.externalId,
          `${t.name}, ${dayLabel(t.testDate)}`,
        ])
      )}
      onChange={(id) => setRange({ schoolYear, [end]: id })}
    >
      {yearTests.map((t) => (
        <MenuItem key={t.externalId} value={t.externalId}>
          {t.name}, {dayLabel(t.testDate)}
        </MenuItem>
      ))}
    </LabeledSelect>
  );

  const anyTicked = ordered.length > 0;

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2.5 }}>
        <Tabs
          value={mode}
          onChange={(_, value) => pickMode(value)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="MONTHLY" label="Monthly" />
          <Tab value="SESSION" label="Test session" />
        </Tabs>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          <Box
            sx={{
              gridColumn: {
                xs: '1 / -1',
                md: mode === 'SESSION' ? 'auto' : '1 / -1',
                lg: 'auto',
              },
            }}
          >
            <LabeledSelect
              label="Class"
              fill
              minWidth={0}
              placeholder="Choose a class"
              value={classId}
              options={Object.fromEntries(
                classes.map((c) => [c.externalId, c.name])
              )}
              onChange={pickClass}
            >
              {classes.map((c) => (
                <MenuItem key={c.externalId} value={c.externalId}>
                  {c.name}
                </MenuItem>
              ))}
            </LabeledSelect>
          </Box>
          {mode === 'MONTHLY' ? (
            <>
              {monthField('From month', 'fromMonth')}
              {yearField('From year', 'fromYear')}
              {monthField('To month', 'toMonth')}
              {yearField('To year', 'toYear')}
            </>
          ) : (
            <>
              <LabeledSelect
                label="School year"
                fill
                minWidth={0}
                placeholder={classId ? 'No session tests' : 'Choose a class'}
                disabled={schoolYears.length === 0}
                value={schoolYear ?? ''}
                options={Object.fromEntries(
                  schoolYears.map((y) => [y, schoolYearLabel(y, startMonth)])
                )}
                onChange={(value) =>
                  setSession({ ...NO_RANGE, schoolYear: Number(value) })
                }
              >
                {schoolYears.map((y) => (
                  <MenuItem key={y} value={y}>
                    {schoolYearLabel(y, startMonth)}
                  </MenuItem>
                ))}
              </LabeledSelect>
              {testField('From test', fromTestId, 'from')}
              {testField('To test', toTestId, 'to')}
            </>
          )}
        </Box>
        {mode === 'SESSION' && yearTests.length > 0 && (
          <FormControlLabel
            sx={{ mt: 1.5 }}
            disabled={!hasEarlier}
            control={
              <Checkbox
                checked={earlierAsRow}
                onChange={(e) => setRange({ earlierAsRow: e.target.checked })}
              />
            }
            label={
              hasEarlier
                ? `Show earlier tests as one row (${yearTests[0].name} – ${yearTests[fromAt - 1].name})`
                : 'Show earlier tests as one row (the range starts at the first test)'
            }
          />
        )}
        {mode === 'MONTHLY' && !periodValid && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            The To month can't be before the From month.
          </Alert>
        )}
        {mode === 'SESSION' && classId && sessionTests.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This class has no session tests yet. Add them on the Tests screen
            with the type Test session.
          </Alert>
        )}
        {mode === 'SESSION' && yearTests.length > 0 && !rangeValid && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            The To test can't be before the From test.
          </Alert>
        )}
        {mode === 'SESSION' && rangeValid && rowsNeeded > CARD_ROWS && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This range needs {rowsNeeded} rows, and a card has room for{' '}
            {CARD_ROWS}, so it will print on two pages. Pick a shorter range,
            then print the rest with “Show earlier tests as one row”.
          </Alert>
        )}
      </Card>

      <Card sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h5" component="h2">
              {ordered.length} result {ordered.length === 1 ? 'card' : 'cards'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.hint' }}>
              {pending > 0
                ? `Preparing ${shown.length + failedCount + 1} of ${ordered.length}`
                : `${ready.length} ready to print`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {classStudents.length > 0 && (
              <Button
                variant="outlined"
                onClick={() =>
                  setUnticked(
                    anyTicked ? classStudents.map((s) => s.externalId) : []
                  )
                }
              >
                {anyTicked ? 'Clear all' : 'Select all'}
              </Button>
            )}
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
        </Box>

        {failedCount > 0 && pending === 0 && (
          <Box sx={{ mb: 1 }}>
            <LoadError
              message={`${failedCount} ${failedCount === 1 ? 'card' : 'cards'} could not load`}
              onRetry={() => dispatch(retryFailedCards())}
            />
          </Box>
        )}

        {classStudents.map((student, index) => {
          const id = student.externalId;
          const name = [student.firstName, student.lastName]
            .filter(Boolean)
            .join(' ');
          const ticked = ordered.includes(id);
          const card = ticked ? cards[id] : undefined;
          const loading = ticked && !card && !!request && !failed.includes(id);
          const hasTests = !!card && card.rows.length > 0;

          return (
            <Box
              key={id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 1,
                borderTop: index ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              <Checkbox
                checked={ticked}
                onChange={(e) =>
                  setUnticked((was) =>
                    e.target.checked
                      ? was.filter((other) => other !== id)
                      : [...was, id]
                  )
                }
                slotProps={{
                  input: { 'aria-label': `Include ${name}` },
                }}
              />
              <StudentAvatar name={name} size={38} dim={!ticked} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 700,
                    color: ticked ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {name}
                </Typography>
                {loading ? (
                  <Skeleton width="55%" />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.hint' }}>
                    {card
                      ? cardSummary(card)
                      : `Roll ${student.rollNumber}${ticked ? '' : ', not included'}`}
                  </Typography>
                )}
              </Box>
              {card && !hasTests && <Chip size="small" label="No tests" />}
              {hasTests && card.missingMarks.length > 0 && (
                <Chip
                  size="small"
                  label="Marks missing"
                  sx={(theme) => ({
                    display: { xs: 'none', sm: 'inline-flex' },
                    bgcolor: theme.palette.studio.amberSoft,
                    color: theme.palette.studio.amberInk,
                  })}
                />
              )}
              <Button
                variant="outlined"
                size="small"
                disabled={!hasTests}
                aria-label={`Preview ${name}`}
                onClick={() => card && setPreview(card)}
              >
                Preview
              </Button>
            </Box>
          );
        })}

        {classStudents.length === 0 && (
          <EmptyState
            title={classId ? 'No students in this class' : 'Choose a class'}
            detail={
              classId
                ? 'Add students to this class first.'
                : "Every student's card appears here, ready to preview and print."
            }
          />
        )}
      </Card>

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
    </Stack>
  );
};

export default ReportsManagement;
