import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
import { MonthList } from '../../../config/constants';
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from '../../../utils/localStorageMethods';
import EmptyState from '../../../common/EmptyState';
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

export default function MarksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { setDirty, confirmLeaving } = useNavigationGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get('class') ?? '';
  const testId = searchParams.get('test') ?? '';

  const classes = useSelector((state: RootState) => state.classes.classes);
  const allTests = useSelector((state: RootState) => state.tests.tests);
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

  const tests = useMemo(
    () =>
      allTests.filter(
        (t) => t.class?.externalId === classId && t.testType === 'MONTHLY'
      ),
    [allTests, classId]
  );

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchTests());
  }, [dispatch]);

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

  const select = (nextClass: string, nextTest: string) => {
    confirmLeaving(() => {
      const next: Record<string, string> = {};
      if (nextClass) next.class = nextClass;
      if (nextTest) next.test = nextTest;
      setSearchParams(next, { replace: true });
    });
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

  const monthLabel = (month: number) =>
    MonthList.find((m) => m.value === month)?.label ?? month;

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'flex-end' }}
      >
        <TextField
          select
          label="Class"
          value={classId}
          disabled={saving}
          onChange={(e) => select(e.target.value, '')}
          sx={{ minWidth: 180 }}
        >
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Test"
          value={tests.some((t) => t.externalId === testId) ? testId : ''}
          disabled={!classId || saving}
          onChange={(e) => select(classId, e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {tests.map((t) => (
            <MenuItem key={t.externalId} value={t.externalId}>
              {`${t.name}, ${monthLabel(t.month)} ${t.year}`}
            </MenuItem>
          ))}
        </TextField>
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
      </Stack>

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

      {!grid && !loading && !error && (
        <Card>
          <EmptyState
            title={classId ? 'Choose a test' : 'Choose a class and test'}
            detail="The whole class appears here, with every subject on the test."
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
