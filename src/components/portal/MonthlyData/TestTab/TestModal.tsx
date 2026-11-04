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

  const { tests, testSubjects, testSubjectsLoading, testSubjectsError } =
    useSelector((state: RootState) => state.tests);
  const { classes } = useSelector((state: RootState) => state.classes);
  const { subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

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
    // Only when empty: a refresh while the form is open would rebuild the
    // subject rows below and undo what's been ticked or typed.
    if (classes.length === 0) dispatch(fetchClasses());
    if (subjects.length === 0) dispatch(fetchSubjects());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const classRows = classSubjects.map((s) => {
      const savedMaxMarks = savedByExternalId.get(s.externalId);
      return {
        subjectExternalId: s.externalId,
        name: s.name,
        included: editing && existingTest ? savedMaxMarks !== undefined : true,
        maxMarks: savedMaxMarks ?? s.maxMarks,
      };
    });

    // A saved subject no longer assigned to the class still belongs to this
    // test: without a row here, saving would remove it.
    const orphanRows =
      subjects.length > 0 && existingTest?.class.externalId === classExternalId
        ? testSubjects
            .filter(
              (ts) =>
                !classSubjects.some(
                  (s) => s.externalId === ts.subject.externalId
                )
            )
            .map((ts) => ({
              subjectExternalId: ts.subject.externalId,
              name: ts.subject.name,
              included: true,
              maxMarks: ts.maxMarks,
            }))
        : [];

    setValue('subjects', [...classRows, ...orphanRows]);
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
      // Sent only when changed, so a rename can't be refused over subjects the
      // admin didn't touch.
      const savedSubjects = new Map(
        testSubjects.map((ts) => [ts.subject.externalId, ts.maxMarks])
      );
      const subjectsUnchanged =
        form.classExternalId === existingTest.class.externalId &&
        subjectsPayload.length === savedSubjects.size &&
        subjectsPayload.every(
          (s) => savedSubjects.get(s.subjectExternalId) === s.maxMarks
        );

      const result = await dispatch(
        editTest({
          externalId: existingTest.externalId,
          data: subjectsUnchanged
            ? base
            : { ...base, subjects: subjectsPayload },
        })
      );
      if (editTest.fulfilled.match(result)) {
        toast.success(result.payload.message);
        onClose();
      } else {
        toast.error((result.payload as string) || 'Failed to update test');
      }
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

          {(subjectsLoading || (editing && testSubjectsLoading)) && (
            <CircularProgress size={20} />
          )}

          {editing && testSubjectsError && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {testSubjectsError}
            </Typography>
          )}

          {!testSubjectsLoading &&
            !subjectsLoading &&
            !testSubjectsError &&
            subjectRows.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                This class has no subjects assigned.
              </Typography>
            )}

          {!testSubjectsLoading &&
            !subjectsLoading &&
            subjectRows.length > 0 && (
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
        disabled={
          isSubmitting ||
          subjectsLoading ||
          (editing && (testSubjectsLoading || !!testSubjectsError))
        }
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
