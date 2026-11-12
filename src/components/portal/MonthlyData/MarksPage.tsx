import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchTests } from '../../../redux/slices/testSlice';
import { fetchDashboard } from '../../../redux/slices/dashboardSlice';
import {
  clearMarksGrid,
  fetchMarksGrid,
  saveMarksGrid,
  type MarksGrid,
} from '../../../redux/slices/scoreSlice';
import { testWhen } from '../../../common/testWhen';
import { TestType } from '../../../@types/global.d';
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from '../../../utils/localStorageMethods';
import { routes } from '../../../config/routes';
import EmptyState from '../../../common/EmptyState';
import LoadError from '../../../common/LoadError';
import FilterBar from '../../../common/FilterBar';
import LabeledSelect from '../../../common/Form/LabeledSelect';
import ProgressBar from '../../../common/ProgressBar';
import { percentOf } from '../../../common/percent';
import { useNavigationGuard } from '../../../layout/NavigationGuard';
import MarksTable, { cellKey, markProblem } from './MarksTable';

const draftKey = (testId: string) => `marksDraft:${testId}`;

const DRAFT_DAYS = 30;

// What was saved when a cell was typed, so a draft can't overwrite newer marks
type Draft = {
  at: number;
  cells: Record<string, { value: string; base: string }>;
};

const sameMark = (a: string, b: string) => {
  const [x, y] = [a.trim(), b.trim()];
  return x === y || (x !== '' && y !== '' && Number(x) === Number(y));
};

const clearDraft = (testId: string) => {
  try {
    localStorage.removeItem(draftKey(testId));
  } catch {
    // Nothing to do: storage is unavailable, so there's no draft either
  }
};

type MarksType = 'monthly' | 'session';
const TYPE_LABELS: Record<MarksType, string> = {
  monthly: 'Monthly',
  session: 'Test session',
};
// In a sentence: "no session tests"
const TYPE_PLURAL: Record<MarksType, string> = {
  monthly: 'monthly tests',
  session: 'session tests',
};
const toMarksType = (testType: TestType): MarksType =>
  testType === TestType.SESSION ? 'session' : 'monthly';

export default function MarksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { setDirty, confirmLeaving } = useNavigationGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get('class') ?? '';
  const testId = searchParams.get('test') ?? '';
  const typeParam = searchParams.get('type');

  const classes = useSelector((state: RootState) => state.classes.classes);
  const {
    tests: allTests,
    loading: testsLoading,
    loadError: testsError,
  } = useSelector((state: RootState) => state.tests);
  const { grid, loading, saving, error } = useSelector(
    (state: RootState) => state.scores
  );

  // What's in each cell now, as typed. Tied to the grid it was filled from, so
  // nothing compares one test's cells against another's while the next one arrives.
  const [cells, setCells] = useState<{
    grid: MarksGrid | null;
    typed: Record<string, string>;
  }>({ grid: null, typed: {} });
  const ready = cells.grid === grid && grid !== null;
  const typed = useMemo(() => (ready ? cells.typed : {}), [ready, cells.typed]);
  const [restored, setRestored] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Monthly and session tests both take marks here, newest first
  const classTests = useMemo(
    () => allTests.filter((t) => t.class?.externalId === classId),
    [allTests, classId]
  );
  // The chosen test decides the type, so a link to a test always shows it.
  // Otherwise the address, then the class's newest test.
  const current = classTests.find((t) => t.externalId === testId);
  const type: MarksType = current
    ? toMarksType(current.testType)
    : typeParam === 'monthly' || typeParam === 'session'
      ? typeParam
      : classTests[0]
        ? toMarksType(classTests[0].testType)
        : 'monthly';
  const tests = useMemo(
    () => classTests.filter((t) => toMarksType(t.testType) === type),
    [classTests, type]
  );

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchTests());
  }, [dispatch]);

  // Opens on the newest test, the one most likely to need marks
  const newest = allTests[0];
  useEffect(() => {
    if (!classId && newest?.class) {
      setSearchParams(
        { class: newest.class.externalId, test: newest.externalId },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, newest]);

  const fetching = useRef<{ abort: () => void } | null>(null);

  const load = (classExternalId: string, testExternalId: string) => {
    fetching.current?.abort();
    fetching.current = dispatch(
      fetchMarksGrid({ classExternalId, testExternalId })
    );
  };

  useEffect(() => {
    dispatch(clearMarksGrid());
    if (classId && testId) load(classId, testId);
    return () => fetching.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, testId]);

  const saved = useMemo(() => {
    const values: Record<string, string> = {};
    grid?.students.forEach((student) =>
      grid.subjects.forEach((subject) => {
        const mark = student.cells[subject.externalId]?.marksObtained;
        values[cellKey(student.externalId, subject.externalId)] =
          mark === null || mark === undefined ? '' : String(mark);
      })
    );
    return values;
  }, [grid]);

  // Filling the cells from what's saved, plus any draft that survived a lost session
  useEffect(() => {
    if (!grid) {
      setCells({ grid: null, typed: {} });
      return;
    }
    const editable = new Set(
      grid.students.flatMap((student) =>
        grid.subjects
          .filter((subject) => student.cells[subject.externalId]?.editable)
          .map((subject) => cellKey(student.externalId, subject.externalId))
      )
    );
    const draft = readFromLocalStorage(
      draftKey(grid.test.externalId)
    ) as Draft | null;
    const fresh =
      draft && Date.now() - draft.at < DRAFT_DAYS * 24 * 60 * 60 * 1000;
    const usable = Object.entries(fresh ? draft.cells : {}).filter(
      ([key, { value, base }]) =>
        editable.has(key) && base === saved[key] && !sameMark(value, saved[key])
    );
    setRestored(usable.length > 0);
    setCells({
      grid,
      typed: {
        ...saved,
        ...Object.fromEntries(usable.map(([key, { value }]) => [key, value])),
      },
    });
  }, [grid, saved]);

  const changes = useMemo(
    () =>
      Object.entries(typed).filter(
        ([key, value]) => !sameMark(value, saved[key] ?? '')
      ),
    [typed, saved]
  );
  const dirty = changes.length > 0;

  useEffect(() => {
    if (!ready || !grid) return;
    const testId = grid.test.externalId;
    setDirty(dirty, () => clearDraft(testId));
    if (dirty) {
      const draft: Draft = {
        at: Date.now(),
        cells: Object.fromEntries(
          changes.map(([key, value]) => [
            key,
            { value, base: saved[key] ?? '' },
          ])
        ),
      };
      writeToLocalStorage(draftKey(testId), draft);
    } else {
      clearDraft(testId);
    }
  }, [ready, grid, dirty, changes, saved, setDirty]);

  useEffect(() => () => setDirty(false), [setDirty]);

  const counts = useMemo(() => {
    let filled = 0;
    let owed = 0;
    let invalid: string | null = null;
    grid?.students.forEach((student) =>
      grid.subjects.forEach((subject) => {
        const cell = student.cells[subject.externalId];
        const value =
          typed[cellKey(student.externalId, subject.externalId)] ?? '';
        if (cell?.owed) {
          owed += 1;
          if (value.trim() !== '') filled += 1;
        }
        const problem = cell?.editable && markProblem(value, subject.maxMarks);
        if (problem && !invalid) {
          invalid = `${student.firstName}, ${subject.name}: ${problem}`;
        }
      })
    );
    return { filled, owed, missing: owed - filled, invalid };
  }, [grid, typed]);

  const percent = percentOf(counts.filled, counts.owed);

  const select = (nextClass: string, nextTest: string, nextType = type) => {
    confirmLeaving(() => {
      const next: Record<string, string> = { type: nextType };
      if (nextClass) next.class = nextClass;
      if (nextTest) next.test = nextTest;
      setSearchParams(next, { replace: true });
    });
  };

  // A new type opens its newest test in the class
  const selectType = (nextType: MarksType) => {
    const newestOfType = classTests.find(
      (t) => toMarksType(t.testType) === nextType
    );
    select(classId, newestOfType?.externalId ?? '', nextType);
  };

  const handleSave = async () => {
    if (!grid || counts.invalid || !dirty) return;
    const result = await dispatch(
      saveMarksGrid({
        classExternalId: grid.class.externalId,
        testExternalId: grid.test.externalId,
        marks: changes.map(([key, value]) => {
          const [studentExternalId, subjectExternalId] = key.split(':');
          const mark = value.trim();
          return {
            studentExternalId,
            subjectExternalId,
            marksObtained: mark === '' ? null : Number(mark),
          };
        }),
      })
    );
    if (saveMarksGrid.fulfilled.match(result)) {
      setRestored(false);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1500);
      toast.success(result.payload);
      load(grid.class.externalId, grid.test.externalId);
      dispatch(fetchDashboard());
    } else {
      toast.error(result.payload as string);
    }
  };

  const discardDraft = () => {
    if (!grid) return;
    setRestored(false);
    setCells({ grid, typed: saved });
  };

  const classNames = Object.fromEntries(
    classes.map((c) => [c.externalId, c.name])
  );
  const testNames = Object.fromEntries(
    tests.map((t) => [t.externalId, `${t.name}, ${testWhen(t)}`])
  );

  return (
    <Stack spacing={2}>
      <FilterBar>
        <LabeledSelect
          label="Class"
          placeholder="Choose a class"
          value={classId}
          disabled={saving}
          options={classNames}
          onChange={(value) => select(value, '')}
        >
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Type"
          value={type}
          disabled={!classId || saving}
          minWidth={160}
          options={TYPE_LABELS}
          onChange={(value) => selectType(value as MarksType)}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Test"
          placeholder={
            tests.length || testsLoading
              ? 'Choose a test'
              : `No ${TYPE_PLURAL[type]}`
          }
          value={tests.some((t) => t.externalId === testId) ? testId : ''}
          disabled={!classId || saving || tests.length === 0}
          minWidth={240}
          options={testNames}
          onChange={(value) => select(classId, value)}
        >
          {tests.map((t) => (
            <MenuItem key={t.externalId} value={t.externalId}>
              {testNames[t.externalId]}
            </MenuItem>
          ))}
        </LabeledSelect>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!dirty || Boolean(counts.invalid) || saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Saving' : justSaved ? 'Saved' : 'Save marks'}
        </Button>
      </FilterBar>

      {restored && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={discardDraft}>
              Discard
            </Button>
          }
        >
          These marks were typed earlier and never saved. Save them to keep
          them.
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => load(classId, testId)}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {grid && (
        <>
          <Card sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.25,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {counts.filled} of {counts.owed} marks entered
              </Typography>
              {counts.missing > 0 ? (
                <Chip
                  size="small"
                  label={`${counts.missing} missing`}
                  sx={(theme) => ({
                    bgcolor: theme.palette.studio.amberSoft,
                    color: theme.palette.studio.amberInk,
                  })}
                />
              ) : (
                <Chip
                  size="small"
                  label="All entered"
                  sx={(theme) => ({
                    bgcolor: theme.palette.studio.greenSoft,
                    color: theme.palette.studio.greenInk,
                  })}
                />
              )}
            </Box>
            <ProgressBar value={percent} label="Marks entered" />
          </Card>

          <Card sx={{ p: 1.5 }}>
            {grid.subjects.length === 0 || grid.students.length === 0 ? (
              <EmptyState
                title={
                  grid.subjects.length === 0
                    ? 'This test has no subjects'
                    : 'No students take these subjects'
                }
                detail={
                  grid.subjects.length === 0
                    ? 'Edit the test to add its subjects.'
                    : 'Add students to this class, or assign them subjects.'
                }
              />
            ) : (
              <MarksTable
                grid={grid}
                typed={typed}
                disabled={saving}
                onChange={(key, value) =>
                  setCells((was) => ({
                    ...was,
                    typed: { ...was.typed, [key]: value },
                  }))
                }
              />
            )}
          </Card>

          {counts.invalid && <Alert severity="error">{counts.invalid}</Alert>}

          <Typography variant="body2" sx={{ color: 'text.hint' }}>
            Amber cells are still empty. A mark over the subject's maximum turns
            red and blocks saving.
          </Typography>
        </>
      )}

      {testsError && (
        <LoadError
          message={testsError}
          onRetry={() => dispatch(fetchTests())}
        />
      )}

      {!grid && !loading && !error && !testsLoading && !testsError && (
        <Card>
          <EmptyState
            icon={<GridOnOutlinedIcon />}
            title={
              allTests.length === 0
                ? 'No tests yet'
                : classTests.length === 0
                  ? 'This class has no tests yet'
                  : tests.length === 0
                    ? `${classNames[classId] ?? 'This class'} has no ${TYPE_PLURAL[type]} yet`
                    : 'Choose a test'
            }
            detail="Add a test, then enter the whole class here, with every subject on one screen."
            action={
              tests.length === 0 ? (
                <Button
                  variant="contained"
                  onClick={() => navigate(routes.portal.tests)}
                >
                  Add a test
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {loading && !grid && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      )}
    </Stack>
  );
}
