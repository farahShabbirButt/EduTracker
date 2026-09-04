// ConductEntry.tsx

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import {
  fetchConduct,
  saveConduct,
  clearConduct,
} from '../../../redux/slices/conductSlice';
import { MonthList } from '../../../config/constants';
import { ConductRating, CONDUCT_RATING_OPTIONS } from './@types/conduct.d';

export default function ConductEntry() {
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((state: RootState) => state.classes);
  const { students } = useSelector((state: RootState) => state.students);
  const {
    conduct,
    loading: conductLoading,
    saving,
    error: conductError,
  } = useSelector((state: RootState) => state.conduct);

  const [selectedClassExternalId, setSelectedClassExternalId] = useState('');
  const [selectedStudentExternalId, setSelectedStudentExternalId] =
    useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [behaviour, setBehaviour] = useState<ConductRating | ''>('');
  const [uniformCleanliness, setUniformCleanliness] = useState<
    ConductRating | ''
  >('');

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
  }, [dispatch]);

  // Students enrolled in the selected class only — mirrors the class-first
  // flow used by Test Marks Entry, so a teacher isn't picking a name out of
  // every student in the school.
  const classStudents = useMemo(
    () =>
      students.filter((s) => s.class?.externalId === selectedClassExternalId),
    [students, selectedClassExternalId]
  );

  useEffect(() => {
    setSelectedStudentExternalId('');
    dispatch(clearConduct());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassExternalId]);

  // Once student + month + year are all chosen, load any conduct already
  // recorded. Aborts a still-in-flight request if the selection changes again
  // before it resolves, so a stale response can't land after a newer one.
  useEffect(() => {
    if (!selectedStudentExternalId || !month || !year) {
      dispatch(clearConduct());
      return;
    }

    const request = dispatch(
      fetchConduct({
        studentExternalId: selectedStudentExternalId,
        month: Number(month),
        year,
      })
    );

    return () => {
      request.abort();
    };
  }, [dispatch, selectedStudentExternalId, month, year]);

  // Seeds the selects from whatever was loaded. A student with nothing
  // recorded yet (`conduct === null`) starts with both selects blank, not an
  // error state.
  useEffect(() => {
    setBehaviour(conduct?.behaviour ?? '');
    setUniformCleanliness(conduct?.uniformCleanliness ?? '');
  }, [conduct]);

  // Both ratings are required together by the PUT body — rather than guess
  // whether the backend accepts a partial update, the Save button just stays
  // off until both are picked. Leaving both blank (a student not yet rated)
  // is still a fully valid, non-erroring state.
  const canSave =
    !!selectedStudentExternalId &&
    !!month &&
    !!year &&
    !!behaviour &&
    !!uniformCleanliness;

  const handleSave = async () => {
    if (
      !selectedStudentExternalId ||
      !month ||
      !year ||
      !behaviour ||
      !uniformCleanliness
    ) {
      return;
    }

    const result = await dispatch(
      saveConduct({
        studentExternalId: selectedStudentExternalId,
        month: Number(month),
        year,
        behaviour,
        uniformCleanliness,
      })
    );

    if (saveConduct.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to save conduct');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Conduct Entry
      </Typography>

      {/* CLASS SELECTION */}
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

      {/* STUDENT SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Student"
        value={selectedStudentExternalId}
        onChange={(e) => setSelectedStudentExternalId(e.target.value)}
        sx={{ mb: 2 }}
        disabled={!selectedClassExternalId}
      >
        {classStudents.map((s) => (
          <MenuItem key={s.externalId} value={s.externalId}>
            {s.firstName} {s.lastName} ({s.rollNumber})
          </MenuItem>
        ))}
      </TextField>

      {/* MONTH / YEAR */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ flex: 1 }}
        >
          {MonthList.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="number"
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          inputProps={{ min: 2000, max: 2100 }}
          sx={{ flex: 1 }}
        />
      </Box>

      {conductLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {conductError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {conductError}
        </Alert>
      )}

      {/* RATINGS — shown once student + month + year are selected. A student
          with nothing recorded yet just shows blank selects here. */}
      {selectedStudentExternalId && !!month && !!year && !conductLoading && (
        <>
          <TextField
            fullWidth
            select
            label="Behaviour"
            value={behaviour}
            onChange={(e) => setBehaviour(e.target.value as ConductRating)}
            sx={{ mb: 2 }}
          >
            {CONDUCT_RATING_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Uniform & Cleanliness"
            value={uniformCleanliness}
            onChange={(e) =>
              setUniformCleanliness(e.target.value as ConductRating)
            }
            sx={{ mb: 3 }}
          >
            {CONDUCT_RATING_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? 'Saving…' : 'Save Conduct'}
          </Button>
        </>
      )}
    </Paper>
  );
}
