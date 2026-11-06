// TestMarksEntry.tsx

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchTests, fetchTestSubjects } from '../../../redux/slices/testSlice';
import {
  fetchMarksEntry,
  saveMarksEntry,
  clearMarksEntry,
  type ScoreItem,
} from '../../../redux/slices/scoreSlice';
import { MonthList } from '../../../config/constants';

export default function TestMarksEntry({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((state: RootState) => state.classes);
  const { tests, testSubjects, testSubjectsLoading } = useSelector(
    (state: RootState) => state.tests
  );
  const {
    marksEntry,
    loading: entryLoading,
    saving,
    error: entryError,
  } = useSelector((state: RootState) => state.scores);

  const [selectedClassExternalId, setSelectedClassExternalId] = useState('');
  const [selectedTestExternalId, setSelectedTestExternalId] = useState('');
  const [selectedSubjectExternalId, setSelectedSubjectExternalId] =
    useState('');

  // NaN marks text the number input can't read, such as a half-typed `4e`
  const [marks, setMarks] = useState<Record<string, number | ''>>({});

  // Bumped on every selection change and on leaving the screen, so a save that
  // finishes afterwards doesn't reload the old selection over the new one.
  const selectionVersion = useRef(0);
  useEffect(
    () => () => {
      selectionVersion.current += 1;
    },
    [selectedClassExternalId, selectedTestExternalId, selectedSubjectExternalId]
  );

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  // Tests for the selected class only (flow: class -> test -> subject).
  useEffect(() => {
    setSelectedTestExternalId('');
    setSelectedSubjectExternalId('');
    dispatch(clearMarksEntry());
    setMarks({});
    if (selectedClassExternalId) {
      dispatch(fetchTests({ classExternalId: selectedClassExternalId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassExternalId]);

  // Subjects actually configured for the selected test — picking from this
  // list (rather than every subject in the class) keeps the subject dropdown
  // from ever offering a combo the backend would reject with SUBJECT_NOT_IN_TEST,
  // and it carries this test's per-subject maxMarks.
  useEffect(() => {
    setSelectedSubjectExternalId('');
    dispatch(clearMarksEntry());
    setMarks({});
    if (!selectedTestExternalId) return;

    const request = dispatch(fetchTestSubjects(selectedTestExternalId));
    return () => request.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTestExternalId]);

  // Once class + test + subject are all chosen, load the students and any
  // previously-saved marks. Aborts a still-in-flight request if the selection
  // changes again before it resolves, so a stale response can't land after a
  // newer one.
  useEffect(() => {
    // Cleared on every change, so one subject's marks are never on screen or
    // saved under another subject while the next one loads.
    dispatch(clearMarksEntry());
    setMarks({});

    if (
      !selectedClassExternalId ||
      !selectedTestExternalId ||
      !selectedSubjectExternalId
    ) {
      return;
    }

    const request = dispatch(
      fetchMarksEntry({
        classExternalId: selectedClassExternalId,
        testExternalId: selectedTestExternalId,
        subjectExternalId: selectedSubjectExternalId,
      })
    );

    return () => {
      request.abort();
    };
  }, [
    dispatch,
    selectedClassExternalId,
    selectedTestExternalId,
    selectedSubjectExternalId,
  ]);

  // Seeds the marks form from whatever the entry fetch loaded. A student
  // whose marksObtained is null starts blank, not 0.
  useEffect(() => {
    if (!marksEntry) {
      setMarks({});
      return;
    }
    const initialMarks: Record<string, number | ''> = {};
    marksEntry.students.forEach((s) => {
      initialMarks[s.externalId] = s.marksObtained ?? '';
    });
    setMarks(initialMarks);
  }, [marksEntry]);

  const maxMarks = marksEntry?.test.maxMarks ?? 0;

  const monthLabel = (month: number) =>
    MonthList.find((m) => m.value === month)?.label ?? month;

  // Listens to `input`, not `change`: a number input reports unreadable text as
  // '', the same as an empty cell, so React sends no change between the two.
  // Only a really empty cell may clear a saved mark.
  const handleMarkInput = (
    studentExternalId: string,
    input: HTMLInputElement | HTMLTextAreaElement
  ) => {
    const value = input.validity.badInput
      ? NaN
      : input.value === ''
        ? ''
        : Number(input.value);
    setMarks((prev) => ({ ...prev, [studentExternalId]: value }));
  };

  const markError = (value: number | '') => {
    if (value === '') return null;
    if (Number.isNaN(value)) return 'Enter a number';
    if (value < 0) return 'Cannot be negative';
    if (value > maxMarks) return `Cannot exceed ${maxMarks}`;
    if (!Number.isInteger(value * 2)) return 'Whole or half marks only';
    return null;
  };

  // NaN counts: half-typed text is still unsaved work
  const dirty = useMemo(
    () =>
      !entryLoading &&
      !!marksEntry &&
      marksEntry.students.some((s) => {
        const value = marks[s.externalId];
        return value !== undefined && !Object.is(value, s.marksObtained ?? '');
      }),
    [marks, marksEntry, entryLoading]
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // Closing or reloading the tab
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const confirmDiscard = (change: () => void) => {
    if (dirty) setPendingChange(() => change);
    else change();
  };

  const hasInvalidMarks = useMemo(
    () => Object.values(marks).some((value) => markError(value) !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marks, maxMarks]
  );

  const handleSave = async () => {
    if (!marksEntry) return;

    if (hasInvalidMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}.`);
      return;
    }

    // A blank cell clears a saved mark; one that was never filled is left out
    const scores = marksEntry.students.flatMap((s): ScoreItem[] => {
      const value = marks[s.externalId];
      if (value !== '' && value !== undefined) {
        return [{ studentExternalId: s.externalId, marksObtained: value }];
      }
      return s.marksObtained === null
        ? []
        : [{ studentExternalId: s.externalId, marksObtained: null }];
    });

    if (scores.length === 0) {
      toast.error('Enter at least one mark before saving.');
      return;
    }

    const selection = {
      classExternalId: selectedClassExternalId,
      testExternalId: selectedTestExternalId,
      subjectExternalId: selectedSubjectExternalId,
    };
    const versionAtSave = selectionVersion.current;
    const result = await dispatch(saveMarksEntry({ ...selection, scores }));

    if (saveMarksEntry.fulfilled.match(result)) {
      toast.success(result.payload.message);
      // Reload so the next save compares against what is really stored
      if (selectionVersion.current === versionAtSave) {
        dispatch(fetchMarksEntry(selection));
      }

      // A student skipped here didn't belong to the class — surfacing the
      // count is the difference between a typo being visible and it being
      // silent.
      if (result.payload.skippedStudentsCount > 0) {
        const count = result.payload.skippedStudentsCount;
        toast.warning(
          `${count} student${count === 1 ? '' : 's'} skipped — not enrolled in this class.`
        );
      }
    } else {
      toast.error((result.payload as string) || 'Failed to save marks');
    }
  };

  //Flow for Monthly Marks Entry
  // select Class
  // Get tests for that class
  // Then select test
  // Then Select Subject
  // Get the students of that selected class and Subject
  // Enter Marks for test
  // Enter marks in list of students

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Test Marks Entry
      </Typography>

      <DeleteDialog
        open={!!pendingChange}
        title="Discard unsaved marks?"
        subtitle="The marks typed here haven't been saved."
        confirmLabel="Discard"
        onCancel={() => setPendingChange(null)}
        onConfirm={() => {
          pendingChange?.();
          setPendingChange(null);
        }}
      />

      {/* Class SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Class"
        value={selectedClassExternalId}
        onChange={(e) => {
          const { value } = e.target;
          confirmDiscard(() => setSelectedClassExternalId(value));
        }}
        disabled={saving}
        sx={{ mb: 2 }}
      >
        {classes.map((c) => (
          <MenuItem key={c.externalId} value={c.externalId}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {/* TEST SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Test"
        value={selectedTestExternalId}
        onChange={(e) => {
          const { value } = e.target;
          confirmDiscard(() => setSelectedTestExternalId(value));
        }}
        sx={{ mb: 2 }}
        disabled={!selectedClassExternalId || saving}
      >
        {tests.map((t) => (
          <MenuItem key={t.externalId} value={t.externalId}>
            {t.name} — {monthLabel(t.month)} {t.year}
          </MenuItem>
        ))}
      </TextField>

      {/* SUBJECT SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Subject"
        sx={{ mb: 2 }}
        value={selectedSubjectExternalId}
        disabled={!selectedTestExternalId || testSubjectsLoading || saving}
        onChange={(e) => {
          const { value } = e.target;
          confirmDiscard(() => setSelectedSubjectExternalId(value));
        }}
      >
        {testSubjects.map((ts) => (
          <MenuItem key={ts.subject.externalId} value={ts.subject.externalId}>
            {ts.subject.name} (Max: {ts.maxMarks})
          </MenuItem>
        ))}
      </TextField>

      {entryLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {entryError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {entryError}
        </Alert>
      )}

      {/* STUDENT MARKS TABLE */}
      {marksEntry && !entryLoading && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Marks Obtained (Max: {maxMarks})
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll No</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Obtained Marks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marksEntry.students.map((st) => {
                const value = marks[st.externalId] ?? '';
                const error = markError(value);
                return (
                  <TableRow key={st.externalId}>
                    <TableCell>{st.rollNumber}</TableCell>
                    <TableCell>
                      {st.firstName} {st.lastName}
                      {st.leftSubject && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          No longer in this class or subject.
                          {st.marksObtained !== null &&
                            ' Mark kept on their card.'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={Number.isNaN(value) ? '' : value}
                        disabled={saving}
                        error={!!error}
                        helperText={error}
                        inputProps={{
                          min: 0,
                          max: maxMarks,
                          step: 0.5,
                          onInput: (e) =>
                            handleMarkInput(st.externalId, e.currentTarget),
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {marksEntry.students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      No students are enrolled in this subject for this class.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}

      {marksEntry && !entryLoading && marksEntry.students.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || hasInvalidMarks}
          >
            {saving ? 'Saving…' : 'Save Marks'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
