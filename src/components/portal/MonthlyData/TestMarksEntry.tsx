// TestMarksEntry.tsx

import { useEffect, useMemo, useState } from 'react';
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
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchTests, fetchTestSubjects } from '../../../redux/slices/testSlice';
import {
  fetchMarksEntry,
  saveMarksEntry,
  clearMarksEntry,
} from '../../../redux/slices/scoreSlice';
import { MonthList } from '../../../config/constants';

export default function TestMarksEntry() {
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

  const [marks, setMarks] = useState<Record<string, number | ''>>({});

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
    if (selectedTestExternalId) {
      dispatch(fetchTestSubjects(selectedTestExternalId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTestExternalId]);

  // Once class + test + subject are all chosen, load the students and any
  // previously-saved marks. Aborts a still-in-flight request if the selection
  // changes again before it resolves, so a stale response can't land after a
  // newer one.
  useEffect(() => {
    if (
      !selectedClassExternalId ||
      !selectedTestExternalId ||
      !selectedSubjectExternalId
    ) {
      dispatch(clearMarksEntry());
      setMarks({});
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

  const handleMarkChange = (studentExternalId: string, rawValue: string) => {
    if (rawValue === '') {
      setMarks((prev) => ({ ...prev, [studentExternalId]: '' }));
      return;
    }
    const value = Number(rawValue);
    if (Number.isNaN(value)) return;
    setMarks((prev) => ({ ...prev, [studentExternalId]: value }));
  };

  const markError = (value: number | '') => {
    if (value === '') return null;
    if (value < 0) return 'Cannot be negative';
    if (value > maxMarks) return `Cannot exceed ${maxMarks}`;
    return null;
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

    const scores = marksEntry.students
      .filter(
        (s) => marks[s.externalId] !== '' && marks[s.externalId] !== undefined
      )
      .map((s) => ({
        studentExternalId: s.externalId,
        marksObtained: Number(marks[s.externalId]),
      }));

    if (scores.length === 0) {
      toast.error('Enter at least one mark before saving.');
      return;
    }

    const result = await dispatch(
      saveMarksEntry({
        classExternalId: selectedClassExternalId,
        testExternalId: selectedTestExternalId,
        subjectExternalId: selectedSubjectExternalId,
        scores,
      })
    );

    if (saveMarksEntry.fulfilled.match(result)) {
      toast.success(result.payload.message);

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

      {/* Class SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Class"
        value={selectedClassExternalId}
        onChange={(e) => setSelectedClassExternalId(e.target.value)}
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
        onChange={(e) => setSelectedTestExternalId(e.target.value)}
        sx={{ mb: 2 }}
        disabled={!selectedClassExternalId}
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
        disabled={!selectedTestExternalId || testSubjectsLoading}
        onChange={(e) => setSelectedSubjectExternalId(e.target.value)}
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
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={value}
                        onChange={(e) =>
                          handleMarkChange(st.externalId, e.target.value)
                        }
                        error={!!error}
                        helperText={error}
                        inputProps={{ min: 0, max: maxMarks }}
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

      {marksEntry && marksEntry.students.length > 0 && (
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
