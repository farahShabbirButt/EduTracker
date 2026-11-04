import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ApiSubject, SubjectFormValues } from '../@types/subject.d';
import { SubjectType } from '../../../../@types/global.d';
import FormTextField from '../../../../common/Form/FormTextField';
import {
  subjectFormSchema,
  type SubjectFormInput,
  type SubjectFormOutput,
} from '../../../../validation/subject.schema';

type Props = {
  open: boolean;
  initial?: Partial<ApiSubject> | null;
  onCancel: () => void;
  // Resolves once the save attempt finishes — the button stays disabled until then
  onSave: (data: SubjectFormValues) => Promise<void> | void;
};

const valuesFrom = (
  subject?: Partial<ApiSubject> | null
): SubjectFormInput => ({
  name: subject?.name ?? '',
  maxMarks: subject?.maxMarks ?? 100,
  subjectType: subject?.subjectType ?? SubjectType.COMPULSORY,
});

export default function SubjectDialog({
  open,
  initial,
  onCancel,
  onSave,
}: Props) {
  const isEdit = !!initial?.externalId;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SubjectFormInput, unknown, SubjectFormOutput>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: valuesFrom(initial),
  });

  useEffect(() => {
    if (open) reset(valuesFrom(initial));
  }, [initial, open, reset]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <form noValidate onSubmit={handleSubmit((values) => onSave(values))}>
        <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField
              name="name"
              control={control}
              autoFocus
              label="Subject Name"
            />
            <FormTextField
              name="maxMarks"
              control={control}
              label="Max Marks"
              type="number"
              helperText="e.g., 100"
              inputProps={{ min: 1 }}
            />
            <FormTextField
              name="subjectType"
              control={control}
              select
              label="Subject Type"
            >
              <MenuItem value={SubjectType.COMPULSORY}>Compulsory</MenuItem>
              <MenuItem value={SubjectType.ELECTIVE}>Elective</MenuItem>
            </FormTextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
