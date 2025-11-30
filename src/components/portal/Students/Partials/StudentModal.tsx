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
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import SubjectIcon from '@mui/icons-material/LibraryBooks';
import type { ClassLevel } from '../../../../@types/global.d';
import type { Student, StudentFormValues } from '../@types/student.d';
import { ClassLevels } from '../../../../config/constants';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: StudentFormValues) => void;
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
  const [values, setValues] = useState<StudentFormValues>(() => ({
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    fatherName: initial?.fatherName ?? '',
    rollNumber: initial?.rollNumber ?? '',
    grade: (initial?.grade as ClassLevel) ?? '6',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
  }));

  useEffect(() => {
    if (open) {
      setValues({
        firstName: initial?.firstName ?? '',
        lastName: initial?.lastName ?? '',
        fatherName: initial?.fatherName ?? '',
        rollNumber: initial?.rollNumber ?? '',
        grade: (initial?.grade as ClassLevel) ?? '6',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
      });
    }
  }, [open, initial]);

  const handleChange =
    (key: keyof StudentFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((p) => ({ ...p, [key]: e.target.value }));
    };

  const handleSubmit = () => {
    // minimal frontend validation
    if (!values.firstName.trim()) return alert('First name is required');
    if (!values.rollNumber.trim()) return alert('Roll number is required');
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'create' ? 'Add New Student' : 'Edit Student'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              value={values.firstName}
              onChange={handleChange('firstName')}
              required
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              value={values.lastName}
              onChange={handleChange('lastName')}
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Father Name"
              value={values.fatherName}
              onChange={handleChange('fatherName')}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Roll Number"
              value={values.rollNumber}
              onChange={handleChange('rollNumber')}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Grade/Class"
              value={values.grade}
              onChange={handleChange('grade')}
              fullWidth
            >
              {ClassLevels.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              value={values.phone}
              onChange={handleChange('phone')}
              fullWidth
              placeholder="03xx-xxxxxxx"
              inputProps={{ inputMode: 'tel' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              value={values.email}
              onChange={handleChange('email')}
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
        <Button variant="contained" onClick={handleSubmit}>
          {mode === 'create' ? 'Add Student' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default StudentModal;
