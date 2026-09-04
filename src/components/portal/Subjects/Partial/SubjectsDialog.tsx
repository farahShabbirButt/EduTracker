import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { ApiSubject, SubjectFormValues } from '../@types/subject.d';
import { SubjectType } from '../../../../@types/global.d';

type Props = {
  open: boolean;
  initial?: Partial<ApiSubject> | null;
  onCancel: () => void;
  onSave: (data: SubjectFormValues) => void;
};

export default function SubjectDialog({
  open,
  initial,
  onCancel,
  onSave,
}: Props) {
  const isEdit = !!initial?.externalId;
  const [name, setName] = React.useState<string>(initial?.name ?? '');
  const [maxMarks, setMaxMarks] = React.useState<number>(
    initial?.maxMarks ?? 100
  );
  const [subjectType, setSubjectType] = React.useState<SubjectType>(
    initial?.subjectType ?? SubjectType.COMPULSORY
  );

  const [errors, setErrors] = React.useState<{
    name?: string;
    maxMarks?: string;
    subjectType?: string;
  }>({});

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setMaxMarks(initial?.maxMarks ?? 100);
    setSubjectType(initial?.subjectType ?? SubjectType.COMPULSORY);
  }, [initial]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Subject name is required';
    if (Number.isNaN(maxMarks) || maxMarks <= 0)
      e.maxMarks = 'Enter a positive number';
    if (!subjectType) e.subjectType = 'Select subject type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Max Marks"
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            error={!!errors.maxMarks}
            helperText={errors.maxMarks || 'e.g., 100'}
            inputProps={{ min: 1 }}
          />
          <TextField
            select
            label="Subject Type"
            value={subjectType}
            onChange={(e) => setSubjectType(e.target.value as SubjectType)}
            error={!!errors.subjectType}
            helperText={errors.subjectType}
          >
            <MenuItem value={SubjectType.COMPULSORY}>Compulsory</MenuItem>
            <MenuItem value={SubjectType.ELECTIVE}>Elective</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (!validate()) return;
            onSave({
              name: name.trim(),
              maxMarks: Number(maxMarks),
              subjectType,
            });
          }}
        >
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
