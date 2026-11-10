import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Class, ClassFormValues } from '../@types/class.d';
import FormPanel from '../../../../common/FormPanel';
import SubjectPicker from '../../../../common/SubjectPicker';
import type { ApiSubject } from '../../Subjects/@types/subject.d';
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
  subjects: ApiSubject[];
  subjectsLoading: boolean;
  // Resolves once the save attempt finishes — the button stays disabled until then
  onSave: (
    values: ClassFormValues,
    subjectIds: string[]
  ) => Promise<void> | void;
}

export default function ClassDialog({
  open,
  initial,
  subjects,
  subjectsLoading,
  onClose,
  onSave,
}: Props) {
  const assigned = subjects.filter((s) =>
    s.classes?.some((c) => c.externalId === initial?.externalId)
  );
  const [selected, setSelected] = useState<string[]>([]);
  // Until something is ticked, the list follows what the class really has, in
  // case the panel opened before subjects had loaded
  const [touched, setTouched] = useState(false);
  const removing = assigned.filter((s) => !selected.includes(s.externalId));
  const emptied = assigned.length > 0 && selected.length === 0 && touched;

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
    if (open) {
      reset({ name: initial?.name ?? '' });
      setTouched(false);
    }
  }, [initial, open, reset]);

  useEffect(() => {
    if (open && !touched) setSelected(assigned.map((s) => s.externalId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open, touched, subjects]);

  return (
    <FormPanel open={open} label="Class details">
      <form
        noValidate
        onSubmit={handleSubmit((values) => onSave(values, selected))}
      >
        <DialogTitle>{initial ? 'Edit class' : 'Add class'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField
              name="name"
              control={control}
              autoFocus
              label="Class name"
              fullWidth
            />
            <SubjectPicker
              subjects={subjects}
              selected={selected}
              onChange={(ids) => {
                setTouched(true);
                setSelected(ids);
              }}
            />
            {emptied ? (
              <Alert severity="warning">
                A class with subjects needs at least one. Tick a subject to
                save.
              </Alert>
            ) : (
              removing.length > 0 && (
                <Alert severity="warning">
                  Saving removes {removing.map((s) => s.name).join(', ')} from
                  this class. Marks already entered stay.
                </Alert>
              )
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || emptied || (!!initial && subjectsLoading)}
          >
            {initial ? 'Save changes' : 'Add class'}
          </Button>
        </DialogActions>
      </form>
    </FormPanel>
  );
}
