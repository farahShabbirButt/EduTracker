import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Class, ClassFormValues } from '../@types/class.d';
import FormTextField from '../../../../common/Form/FormTextField';
import {
  classFormSchema,
  type ClassFormInput,
  type ClassFormOutput,
} from '../../../../validation/class.schema';

interface Props {
  open: boolean;
  initial: Class | null;
  onClose: () => void;
  // Resolves once the save attempt finishes — the button stays disabled until then
  onSave: (values: ClassFormValues) => Promise<void> | void;
}

export default function ClassDialog({ open, initial, onClose, onSave }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ClassFormInput, unknown, ClassFormOutput>({
    resolver: zodResolver(classFormSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) reset({ name: initial?.name ?? '' });
  }, [initial, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form noValidate onSubmit={handleSubmit((values) => onSave(values))}>
        <DialogTitle>{initial ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField
              name="name"
              control={control}
              autoFocus
              label="Class Name"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initial ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
