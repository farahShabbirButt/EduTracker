// src/components/subjects/GradeBoundariesDialog.tsx
import * as React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  fetchGradeScales,
  addGradeScale,
  editGradeScale,
  removeGradeScale,
} from '../../../../redux/slices/gradeSlice';
import type { ApiGradeScale, GradeScaleFormValues } from '../@types/subject.d';
import DeleteDialog from '../../../../common/Dialogs/DeleteDialog/DeleteDialog';

type Props = {
  open: boolean;
  onClose: () => void;
};

const emptyForm: GradeScaleFormValues = {
  grade: '',
  minPercentage: 0,
  maxPercentage: 0,
  remarks: '',
};

export default function GradeBoundariesDialog({ open, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { gradeScales, loading } = useSelector(
    (state: RootState) => state.grades
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ApiGradeScale | null>(null);
  const [form, setForm] = React.useState<GradeScaleFormValues>(emptyForm);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiGradeScale | null>(
    null
  );

  React.useEffect(() => {
    dispatch(fetchGradeScales());
  }, [dispatch]);

  const sorted = React.useMemo(
    () => [...gradeScales].sort((a, b) => b.minPercentage - a.minPercentage),
    [gradeScales]
  );

  // Client-side check so a round trip isn't needed just to be told "overlaps" —
  // the backend enforces the same rules and is still the authority (its error
  // is surfaced separately if it rejects the request).
  const validate = (candidate: GradeScaleFormValues): string | null => {
    if (!candidate.grade.trim()) return 'Grade label is required.';
    if (!candidate.remarks.trim()) return 'Remarks are required.';
    const { minPercentage, maxPercentage } = candidate;
    if (Number.isNaN(minPercentage) || Number.isNaN(maxPercentage)) {
      return 'Enter valid minimum and maximum percentages.';
    }
    if (minPercentage < 0 || maxPercentage > 100) {
      return 'Percentages must be between 0 and 100.';
    }
    if (minPercentage >= maxPercentage) {
      return 'Minimum percentage must be less than maximum percentage.';
    }
    const overlapping = gradeScales.find((g) => {
      if (editing && g.externalId === editing.externalId) return false;
      return (
        minPercentage <= g.maxPercentage && maxPercentage >= g.minPercentage
      );
    });
    if (overlapping) {
      return `Overlaps with ${overlapping.grade} (${overlapping.minPercentage}-${overlapping.maxPercentage}%).`;
    }
    return null;
  };

  const openAddForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (row: ApiGradeScale) => {
    setEditing(row);
    setForm({
      grade: row.grade,
      minPercentage: row.minPercentage,
      maxPercentage: row.maxPercentage,
      remarks: row.remarks,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async () => {
    const candidate: GradeScaleFormValues = {
      ...form,
      minPercentage: Number(form.minPercentage),
      maxPercentage: Number(form.maxPercentage),
    };
    const err = validate(candidate);
    if (err) {
      setFormError(err);
      return;
    }

    const payload = {
      ...candidate,
      grade: candidate.grade.trim(),
      remarks: candidate.remarks.trim(),
    };
    const result = editing
      ? await dispatch(
          editGradeScale({ externalId: editing.externalId, data: payload })
        )
      : await dispatch(addGradeScale(payload));

    if (
      addGradeScale.fulfilled.match(result) ||
      editGradeScale.fulfilled.match(result)
    ) {
      toast.success(result.payload.message);
      closeForm();
    } else {
      // Client-side validation isn't authoritative — surface the backend's
      // rejection (e.g. a race against another edit) rather than assuming ours
      // already covered it.
      toast.error((result.payload as string) || 'Failed to save grade band');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(removeGradeScale(deleteTarget.externalId));
    if (removeGradeScale.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to delete grade band');
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Grade Boundaries</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grade</TableCell>
                <TableCell>Min %</TableCell>
                <TableCell>Max %</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.externalId}>
                  <TableCell>{row.grade}</TableCell>
                  <TableCell>{row.minPercentage}</TableCell>
                  <TableCell>{row.maxPercentage}</TableCell>
                  <TableCell>
                    <Tooltip title={row.remarks}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 280,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.remarks}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditForm(row)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      No grade bands yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {formOpen && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography variant="subtitle2">
                {editing ? 'Edit Grade Band' : 'Add Grade Band'}
              </Typography>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Grade"
                  value={form.grade}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, grade: e.target.value }))
                  }
                  sx={{ width: { sm: 140 } }}
                />
                <TextField
                  label="Min %"
                  type="number"
                  value={form.minPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minPercentage: Number(e.target.value),
                    }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ width: { sm: 140 } }}
                />
                <TextField
                  label="Max %"
                  type="number"
                  value={form.maxPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxPercentage: Number(e.target.value),
                    }))
                  }
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ width: { sm: 140 } }}
                />
              </Stack>
              <TextField
                label="Remarks"
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={closeForm}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                  {editing ? 'Save Changes' : 'Add'}
                </Button>
              </Stack>
            </Stack>
          )}

          {!formOpen && (
            <Button
              startIcon={<AddIcon />}
              onClick={openAddForm}
              sx={{ mt: 2 }}
            >
              Add Grade Band
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={!!deleteTarget}
        title="Delete grade band?"
        subtitle={`You are about to delete "${deleteTarget?.grade ?? ''}".`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
