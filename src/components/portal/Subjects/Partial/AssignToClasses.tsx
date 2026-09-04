// src/components/subjects/AssignToGradesDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchClasses } from '../../../../redux/slices/classSlice';
import { assignSubjectsToClass } from '../../../../redux/slices/subjectSlice';
import type { ApiSubject } from '../@types/subject.d';

type Props = {
  open: boolean;
  allSubjects: ApiSubject[]; // full list to choose from
  onClose: () => void;
};

export default function AssignToClassesDialog({
  open,
  onClose,
  allSubjects,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, loading: classesLoading } = useSelector(
    (state: RootState) => state.classes
  );

  const [classId, setClassId] = React.useState('');
  const [selected, setSelected] = React.useState<ApiSubject[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && classes.length === 0) {
      dispatch(fetchClasses());
    }
  }, [open, classes.length, dispatch]);

  // Default to the first class once the list is available.
  React.useEffect(() => {
    if (open && !classId && classes.length > 0) {
      setClassId(classes[0].externalId);
    }
  }, [open, classId, classes]);

  React.useEffect(() => {
    if (!classId) {
      setSelected([]);
      return;
    }
    setSelected(
      allSubjects.filter((s) =>
        s.classes?.some((c) => c.externalId === classId)
      )
    );
  }, [classId, allSubjects]);

  const handleSave = async () => {
    if (!classId || selected.length === 0) return;
    setSubmitting(true);
    const result = await dispatch(
      assignSubjectsToClass({
        classId,
        subjectIds: selected.map((s) => s.externalId),
      })
    );
    setSubmitting(false);

    if (assignSubjectsToClass.fulfilled.match(result)) {
      toast.success(result.payload);
      onClose();
    } else {
      toast.error((result.payload as string) || 'Failed to assign subjects');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Subjects to Classes</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            disabled={classesLoading || classes.length === 0}
            helperText={
              !classesLoading && classes.length === 0
                ? 'No classes available yet'
                : undefined
            }
            sx={{ width: 220 }}
          >
            {classes.map((c) => (
              <MenuItem key={c.externalId} value={c.externalId}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={allSubjects}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(option, value) =>
              option.externalId === value.externalId
            }
            value={selected}
            onChange={(_, v) => setSelected(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select subjects"
                placeholder="Start typing..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.externalId}
                  label={`${option.name} (${option.maxMarks})`}
                />
              ))
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          disabled={!classId || selected.length === 0 || submitting}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
