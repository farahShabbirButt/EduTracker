import { useEffect, useMemo, useState } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { MonthList } from '../../../../config/constants';
import { TestType } from '../../../../@types/global.d';
import type { TestSubjectInput } from '../@types/testData.d';
import {
  addTest,
  editTest,
  fetchTestSubjects,
  updateTestSubjects,
} from '../../../../redux/slices/testSlice';
import { fetchClasses } from '../../../../redux/slices/classSlice';
import { fetchSubjects } from '../../../../redux/slices/subjectSlice';

type SubjectRow = {
  subjectExternalId: string;
  name: string;
  included: boolean;
  maxMarks: number;
};

export default function TestModal({
  onClose,
  editTestId,
}: {
  onClose: () => void;
  editTestId: string | null;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const editing = Boolean(editTestId);

  const { tests, testSubjects, testSubjectsLoading } = useSelector(
    (state: RootState) => state.tests
  );
  const { classes } = useSelector((state: RootState) => state.classes);
  const { subjects } = useSelector((state: RootState) => state.subjects);

  const existingTest = editing
    ? tests.find((t) => t.externalId === editTestId)
    : null;

  const [form, setForm] = useState({
    name: '',
    month: '',
    year: new Date().getFullYear(),
    classExternalId: '',
    testType: TestType.MONTHLY,
  });
  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (existingTest) {
      setForm({
        name: existingTest.name,
        month: String(existingTest.month),
        year: existingTest.year,
        classExternalId: existingTest.class.externalId,
        testType: existingTest.testType,
      });
      dispatch(fetchTestSubjects(existingTest.externalId));
    }
    // Only reload the saved subjects when the test being edited changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTest?.externalId]);

  // Rebuilds the subject checklist whenever the chosen class, the subject
  // catalogue, or the test's already-saved subjects change. Uses
  // subject.classes[].externalId to find a class's subjects — class names in
  // this database aren't bare grade strings, so identity must go through
  // externalId, never a name comparison.
  useEffect(() => {
    if (!form.classExternalId) {
      setSubjectRows([]);
      return;
    }

    const classSubjects = subjects.filter((s) =>
      s.classes?.some((c) => c.externalId === form.classExternalId)
    );

    const savedByExternalId = new Map(
      editing && existingTest
        ? testSubjects.map((ts) => [ts.subject.externalId, ts.maxMarks])
        : []
    );

    setSubjectRows(
      classSubjects.map((s) => {
        const savedMaxMarks = savedByExternalId.get(s.externalId);
        return {
          subjectExternalId: s.externalId,
          name: s.name,
          included:
            editing && existingTest ? savedMaxMarks !== undefined : true,
          maxMarks: savedMaxMarks ?? s.maxMarks,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.classExternalId, subjects, testSubjects]);

  const handleChange = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleSubject = (subjectExternalId: string) => {
    setSubjectRows((prev) =>
      prev.map((row) =>
        row.subjectExternalId === subjectExternalId
          ? { ...row, included: !row.included }
          : row
      )
    );
  };

  const setSubjectMaxMarks = (subjectExternalId: string, value: number) => {
    setSubjectRows((prev) =>
      prev.map((row) =>
        row.subjectExternalId === subjectExternalId
          ? { ...row, maxMarks: value }
          : row
      )
    );
  };

  const includedRows = useMemo(
    () => subjectRows.filter((row) => row.included),
    [subjectRows]
  );

  // Live derived total (spec §3.2b) — shown before saving since the backend
  // is the actual authority on `totalMarks` once it recomputes it.
  const derivedTotal = useMemo(
    () =>
      includedRows.reduce((sum, row) => sum + (Number(row.maxMarks) || 0), 0),
    [includedRows]
  );

  const buildSubjectsPayload = (): TestSubjectInput[] =>
    includedRows.map((row) => ({
      subjectExternalId: row.subjectExternalId,
      maxMarks: Number(row.maxMarks),
    }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.month || !form.classExternalId) {
      toast.error('Fill in the test name, month, and class.');
      return;
    }
    if (includedRows.length === 0) {
      toast.error('Include at least one subject.');
      return;
    }

    setSaving(true);
    const subjectsPayload = buildSubjectsPayload();

    if (editing && existingTest) {
      const baseResult = await dispatch(
        editTest({
          externalId: existingTest.externalId,
          data: {
            name: form.name,
            testType: form.testType,
            month: Number(form.month),
            year: Number(form.year),
            classExternalId: form.classExternalId,
            totalMarks: derivedTotal,
          },
        })
      );
      if (!editTest.fulfilled.match(baseResult)) {
        toast.error((baseResult.payload as string) || 'Failed to update test');
        setSaving(false);
        return;
      }

      const subjectsResult = await dispatch(
        updateTestSubjects({
          externalId: existingTest.externalId,
          subjects: subjectsPayload,
        })
      );
      setSaving(false);
      if (!updateTestSubjects.fulfilled.match(subjectsResult)) {
        // e.g. 409 TEST_SUBJECT_HAS_SCORES — surface the backend's wording,
        // don't swallow it into a generic message.
        toast.error(
          (subjectsResult.payload as string) || 'Failed to update test subjects'
        );
        return;
      }

      toast.success(subjectsResult.payload.message);
      onClose();
      return;
    }

    const result = await dispatch(
      addTest({
        name: form.name,
        testType: form.testType,
        month: Number(form.month),
        year: Number(form.year),
        classExternalId: form.classExternalId,
        totalMarks: derivedTotal,
        subjects: subjectsPayload,
      })
    );
    setSaving(false);
    if (addTest.fulfilled.match(result)) {
      toast.success(result.payload.message);
      onClose();
    } else {
      toast.error((result.payload as string) || 'Failed to create test');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {editing ? 'Edit Test' : 'Add New Test'}
      </Typography>

      <TextField
        label="Test Name"
        fullWidth
        sx={{ mb: 2 }}
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Select Month"
        sx={{ mb: 2 }}
        value={form.month}
        onChange={(e) => handleChange('month', e.target.value)}
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
        fullWidth
        sx={{ mb: 2 }}
        value={form.year}
        onChange={(e) => handleChange('year', e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Class"
        sx={{ mb: 2 }}
        value={form.classExternalId}
        onChange={(e) => handleChange('classExternalId', e.target.value)}
      >
        {classes.map((c) => (
          <MenuItem key={c.externalId} value={c.externalId}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="Select Type"
        sx={{ mb: 2 }}
        value={form.testType}
        onChange={(e) => handleChange('testType', e.target.value)}
      >
        <MenuItem key={TestType.MONTHLY} value={TestType.MONTHLY}>
          Monthly
        </MenuItem>
        <MenuItem key={TestType.SESSION} value={TestType.SESSION}>
          Test Session
        </MenuItem>
      </TextField>

      {form.classExternalId && (
        <Box sx={{ mb: 2 }}>
          <Divider sx={{ mb: 1.5 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Subjects
          </Typography>

          {editing && testSubjectsLoading && <CircularProgress size={20} />}

          {!testSubjectsLoading && subjectRows.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              This class has no subjects assigned.
            </Typography>
          )}

          {!testSubjectsLoading && subjectRows.length > 0 && (
            <Stack spacing={1}>
              {subjectRows.map((row) => (
                <Stack
                  key={row.subjectExternalId}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <FormControlLabel
                    sx={{ minWidth: 200 }}
                    control={
                      <Checkbox
                        checked={row.included}
                        onChange={() => toggleSubject(row.subjectExternalId)}
                      />
                    }
                    label={row.name}
                  />
                  <TextField
                    type="number"
                    label="Max Marks"
                    size="small"
                    value={row.maxMarks}
                    disabled={!row.included}
                    onChange={(e) =>
                      setSubjectMaxMarks(
                        row.subjectExternalId,
                        Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 1 }}
                  />
                </Stack>
              ))}
            </Stack>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Total Marks: {derivedTotal}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleSave}
        fullWidth
        sx={{ mt: 1 }}
        disabled={saving}
      >
        {editing ? 'Update Test' : 'Create Test'}
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        fullWidth
        sx={{ mt: 1 }}
        disabled={saving}
      >
        Cancel
      </Button>
    </Box>
  );
}
