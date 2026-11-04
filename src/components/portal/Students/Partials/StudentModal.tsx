import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SubjectIcon from '@mui/icons-material/LibraryBooks';
import type { Student, StudentFormValues } from '../@types/student.d';
import type { RootState, AppDispatch } from '../../../../redux/store';
import { fetchClasses } from '../../../../redux/slices/classSlice';
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
}

const StudentModal = ({
  open,
  onClose,
  onSubmit,
  mode,
  initial,
}: StudentFormDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((state: RootState) => state.classes);

  const valuesFrom = (student?: Partial<Student>): StudentFormInput => ({
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    fatherName: student?.fatherName ?? '',
    rollNumber: student?.rollNumber ?? '',
    classId: student?.class?.externalId ?? classes[0]?.externalId ?? '', // Using externalId for class selection
    contactNo: student?.contactNo ?? '',
    email: student?.email ?? '',
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
    if (open) reset(valuesFrom(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form
        noValidate
        onSubmit={handleSubmit((values) => onSubmit(toStudentPayload(values)))}
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

            {/* Assign subjects (placeholder for now) */}
            <Grid size={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SubjectIcon fontSize="small" />
                <Chip
                  label="Assign Subjects (coming soon)"
                  color="default"
                  variant="outlined"
                  disabled
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === 'create' ? 'Add Student' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default StudentModal;
