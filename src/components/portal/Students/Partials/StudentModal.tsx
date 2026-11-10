import {
  Alert,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Student, StudentFormValues } from '../@types/student.d';
import type { RootState, AppDispatch } from '../../../../redux/store';
import { fetchClasses } from '../../../../redux/slices/classSlice';
import { fetchSubjects } from '../../../../redux/slices/subjectSlice';
import FormPanel from '../../../../common/FormPanel';
import FormTextField from '../../../../common/Form/FormTextField';
import {
  studentFormSchema,
  toStudentPayload,
  type StudentFormInput,
  type StudentFormOutput,
} from '../../../../validation/student.schema';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  // Resolves once the save attempt finishes — the button stays disabled until then
  onSubmit: (payload: StudentFormValues) => Promise<void> | void;
  mode: 'create' | 'edit';
  initial?: Partial<Student>;
  // The class a new student starts in
  defaultClassId?: string;
}

const StudentModal = ({
  open,
  onClose,
  onSubmit,
  mode,
  initial,
  defaultClassId,
}: StudentFormDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((state: RootState) => state.classes);
  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useSelector((state: RootState) => state.subjects);

  const valuesFrom = (student?: Partial<Student>): StudentFormInput => ({
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    fatherName: student?.fatherName ?? '',
    rollNumber: student?.rollNumber ?? '',
    classId: student?.class?.externalId ?? defaultClassId ?? '', // Using externalId for class selection
    contactNo: student?.contactNo ?? '',
    email: student?.email ?? '',
    electiveSubjectIds:
      student?.subjects
        ?.filter((s) => s.subjectType === 'ELECTIVE')
        .map((s) => s.externalId) ?? [],
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StudentFormInput, unknown, StudentFormOutput>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: valuesFrom(initial),
  });

  useEffect(() => {
    if (classes.length === 0) {
      dispatch(fetchClasses());
    }
  }, [dispatch, classes.length]);

  useEffect(() => {
    if (open) dispatch(fetchSubjects());
  }, [dispatch, open]);

  useEffect(() => {
    if (open) reset(valuesFrom(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const selectedClassId = useWatch({ control, name: 'classId' });
  const subjectsReady = !subjectsLoading && !subjectsError;
  const classElectives = subjects.filter(
    (s) =>
      s.subjectType === 'ELECTIVE' &&
      s.classes?.some((c) => c.externalId === selectedClassId)
  );

  // Only electives of the chosen class go out, so changing class drops the old ones
  const toPayload = (values: StudentFormOutput): StudentFormValues => {
    const { electiveSubjectIds, ...rest } = toStudentPayload(values);
    return subjectsReady
      ? {
          ...rest,
          electiveSubjectIds: electiveSubjectIds.filter((id) =>
            classElectives.some((s) => s.externalId === id)
          ),
        }
      : rest;
  };

  return (
    <FormPanel open={open} label="Student details">
      <form
        noValidate
        onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}
      >
        <DialogTitle>
          {mode === 'create' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="firstName"
                control={control}
                label="First Name"
                required
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="lastName"
                control={control}
                label="Last Name"
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <FormTextField
                name="fatherName"
                control={control}
                label="Father Name"
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="rollNumber"
                control={control}
                label="Roll Number"
                required
                fullWidth
                // The update API doesn't accept rollNumber, so an edit here would be silently dropped
                disabled={mode === 'edit'}
                helperText={
                  mode === 'edit'
                    ? "Can't be changed after creation"
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="classId"
                control={control}
                select
                label="Grade/Class"
                required
                fullWidth
              >
                {classes.map((c) => (
                  <MenuItem key={c.externalId} value={c.externalId}>
                    {c.name}
                  </MenuItem>
                ))}
              </FormTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="contactNo"
                control={control}
                label="Contact No"
                fullWidth
                placeholder="03xx-xxxxxxx"
                inputProps={{ inputMode: 'tel' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="email"
                control={control}
                label="Email"
                fullWidth
                type="email"
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Electives
              </Typography>
              {subjectsError ? (
                <Alert severity="warning">
                  Subjects couldn't load, so electives can't be changed.
                  Changing class removes them.
                </Alert>
              ) : subjectsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading subjects…
                </Typography>
              ) : classElectives.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {selectedClassId
                    ? 'This class has no electives.'
                    : 'Choose a class to see its electives.'}
                </Typography>
              ) : (
                <Controller
                  name="electiveSubjectIds"
                  control={control}
                  render={({ field }) => (
                    <FormGroup row>
                      {classElectives.map((s) => (
                        <FormControlLabel
                          key={s.externalId}
                          label={s.name}
                          control={
                            <Checkbox
                              checked={field.value.includes(s.externalId)}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.checked
                                    ? [...field.value, s.externalId]
                                    : field.value.filter(
                                        (id) => id !== s.externalId
                                      )
                                )
                              }
                            />
                          }
                        />
                      ))}
                    </FormGroup>
                  )}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || subjectsLoading}
          >
            {mode === 'create' ? 'Add Student' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </FormPanel>
  );
};
export default StudentModal;
