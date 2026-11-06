import * as React from 'react';
import {
  Alert,
  Button,
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
import { fetchDashboard } from '../../../../redux/slices/dashboardSlice';
import { assignSubjectsToClass } from '../../../../redux/slices/subjectSlice';
import FormPanel from '../../../../common/FormPanel';
import SubjectPicker from '../../../../common/SubjectPicker';
import type { ApiSubject } from '../@types/subject.d';

type Props = {
  open: boolean;
  allSubjects: ApiSubject[]; // full list to choose from
  // The class to open on, when opened from that class
  initialClassId?: string;
  onClose: () => void;
};

export default function AssignToClassesDialog({
  open,
  onClose,
  allSubjects,
  initialClassId,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    classes,
    loading: classesLoading,
    loadError: classesLoadError,
  } = useSelector((state: RootState) => state.classes);

  const [classId, setClassId] = React.useState('');
  const [selected, setSelected] = React.useState<ApiSubject[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && classes.length === 0) {
      dispatch(fetchClasses());
    }
  }, [open, classes.length, dispatch]);

  // Open on the class asked for. Otherwise keep the last one, if it still exists.
  React.useEffect(() => {
    if (!open || classes.length === 0) return;
    if (initialClassId) {
      setClassId(initialClassId);
    } else if (!classes.some((c) => c.externalId === classId)) {
      setClassId(classes[0].externalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialClassId, classes]);

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
    // `open`: reopening drops edits abandoned with Close
  }, [classId, allSubjects, open]);

  const removing = allSubjects.filter(
    (s) =>
      s.classes?.some((c) => c.externalId === classId) &&
      !selected.some((chosen) => chosen.externalId === s.externalId)
  );

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
      dispatch(fetchDashboard());
      onClose();
    } else {
      toast.error((result.payload as string) || 'Failed to assign subjects');
    }
  };

  return (
    <FormPanel open={open} label="Assign subjects to a class">
      <DialogTitle>Assign subjects to a class</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            disabled={classesLoading || classes.length === 0}
            helperText={
              classesLoadError ??
              (!classesLoading && classes.length === 0
                ? 'No classes available yet'
                : undefined)
            }
            fullWidth
          >
            {classes.map((c) => (
              <MenuItem key={c.externalId} value={c.externalId}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <SubjectPicker
            subjects={allSubjects}
            selected={selected.map((s) => s.externalId)}
            onChange={(ids) =>
              setSelected(allSubjects.filter((s) => ids.includes(s.externalId)))
            }
          />

          {removing.length > 0 && (
            <Alert severity="warning">
              Saving removes {removing.map((s) => s.name).join(', ')} from this
              class. Marks already entered stay, but new tests won't offer{' '}
              {removing.length === 1 ? 'it' : 'them'}.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!classId || selected.length === 0 || submitting}
          onClick={handleSave}
        >
          Save subjects
        </Button>
      </DialogActions>
    </FormPanel>
  );
}
