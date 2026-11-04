import { useEffect, useMemo } from 'react';
import {
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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import FormTextField from '../../../../common/Form/FormTextField';
import {
  testFormSchema,
  type TestFormInput,
  type TestFormOutput,
  type TestSubjectRow,
} from '../../../../validation/test.schema';

const emptyForm: TestFormInput = {
  name: '',
  month: '',
  year: new Date().getFullYear(),
  classExternalId: '',
  testType: TestType.MONTHLY,
  subjects: [],
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestFormInput, unknown, TestFormOutput>({
    resolver: zodResolver(testFormSchema),
    defaultValues: emptyForm,
  });

  const classExternalId = useWatch({ control, name: 'classExternalId' });
  const subjectRows = useWatch({ control, name: 'subjects' });

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (!existingTest) return;

    reset({
      name: existingTest.name,
      month: existingTest.month,
      year: existingTest.year,
      classExternalId: existingTest.class.externalId,
      testType: existingTest.testType,
      subjects: [],
    });
    dispatch(fetchTestSubjects(existingTest.externalId));
    // Only reload the saved subjects when the test being edited changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTest?.externalId]);

  // Rebuilds the subject checklist whenever the chosen class, the subject
  // catalogue, or the test's already-saved subjects change. Uses
  // subject.classes[].externalId to find a class's subjects — class names in
  // this database aren't bare grade strings, so identity must go through
  // externalId, never a name comparison.
  useEffect(() => {
    if (!classExternalId) {
      setValue('subjects', []);
      return;
    }

    const classSubjects = subjects.filter((s) =>
      s.classes?.some((c) => c.externalId === classExternalId)
    );

    const savedByExternalId = new Map(
      editing && existingTest
        ? testSubjects.map((ts) => [ts.subject.externalId, ts.maxMarks])
        : []
    );

    setValue(
      'subjects',
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
  }, [classExternalId, subjects, testSubjects]);

  // Live derived total (spec §3.2b) — shown before saving since the backend
  // is the actual authority on `totalMarks` once it recomputes it.
  const derivedTotal = useMemo(
    () =>
      (subjectRows ?? [])
        .filter((row) => row.included)
        .reduce((sum, row) => sum + (Number(row.maxMarks) || 0), 0),
    [subjectRows]
  );

  const buildSubjectsPayload = (rows: TestSubjectRow[]): TestSubjectInput[] =>
    rows
      .filter((row) => row.included)
      .map((row) => ({
        subjectExternalId: row.subjectExternalId,
        maxMarks: row.maxMarks,
      }));

  const onSubmit = async (form: TestFormOutput) => {
    const subjectsPayload = buildSubjectsPayload(form.subjects);
    const totalMarks = subjectsPayload.reduce((sum, s) => sum + s.maxMarks, 0);
    const base = {
      name: form.name,
      testType: form.testType,
      month: form.month,
      year: form.year,
      classExternalId: form.classExternalId,
      totalMarks,
    };

    if (editing && existingTest) {
      const baseResult = await dispatch(
        editTest({ externalId: existingTest.externalId, data: base })
      );
      if (!editTest.fulfilled.match(baseResult)) {
        toast.error((baseResult.payload as string) || 'Failed to update test');
        return;
      }

      const subjectsResult = await dispatch(
        updateTestSubjects({
          externalId: existingTest.externalId,
          subjects: subjectsPayload,
        })
      );
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
      addTest({ ...base, subjects: subjectsPayload })
    );
    if (addTest.fulfilled.match(result)) {
      toast.success(result.payload.message);
      onClose();
    } else {
      toast.error((result.payload as string) || 'Failed to create test');
    }
  };

  // "Include at least one subject" is raised on the array itself, not a row
  const subjectsError = (errors.subjects as { message?: string } | undefined)
    ?.message;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {editing ? 'Edit Test' : 'Add New Test'}
      </Typography>

      <FormTextField
        name="name"
        control={control}
        label="Test Name"
        fullWidth
        sx={{ mb: 2 }}
      />

      <FormTextField
        name="month"
        control={control}
        select
        fullWidth
        label="Select Month"
        sx={{ mb: 2 }}
      >
        {MonthList.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            {m.label}
          </MenuItem>
        ))}
      </FormTextField>

      <FormTextField
        name="year"
        control={control}
        type="number"
        label="Year"
        fullWidth
        sx={{ mb: 2 }}
      />

      <FormTextField
        name="classExternalId"
        control={control}
        select
        fullWidth
        label="Class"
        sx={{ mb: 2 }}
      >
        {classes.map((c) => (
          <MenuItem key={c.externalId} value={c.externalId}>
            {c.name}
          </MenuItem>
        ))}
      </FormTextField>

      <FormTextField
        name="testType"
        control={control}
        select
        fullWidth
        label="Select Type"
        sx={{ mb: 2 }}
      >
        <MenuItem key={TestType.MONTHLY} value={TestType.MONTHLY}>
          Monthly
        </MenuItem>
        <MenuItem key={TestType.SESSION} value={TestType.SESSION}>
          Test Session
        </MenuItem>
      </FormTextField>

      {classExternalId && (
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
              {subjectRows.map((row, i) => (
                <Stack
                  key={row.subjectExternalId}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Controller
                    name={`subjects.${i}.included`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ minWidth: 200 }}
                        control={
                          <Checkbox
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={row.name}
                      />
                    )}
                  />
                  <FormTextField
                    name={`subjects.${i}.maxMarks`}
                    control={control}
                    type="number"
                    label="Max Marks"
                    size="small"
                    disabled={!row.included}
                    inputProps={{ min: 1 }}
                  />
                </Stack>
              ))}
            </Stack>
          )}

          {subjectsError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {subjectsError}
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Total Marks: {derivedTotal}
          </Typography>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 1 }}
        disabled={isSubmitting}
      >
        {editing ? 'Update Test' : 'Create Test'}
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        fullWidth
        sx={{ mt: 1 }}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </Box>
  );
}
