import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
import EmptyState from '../../../../common/EmptyState';
import FormPanel from '../../../../common/FormPanel';
import LoadError from '../../../../common/LoadError';

const emptyForm: GradeScaleFormValues = {
  grade: '',
  minPercentage: 0,
  maxPercentage: 0,
  remarks: '',
};

export default function GradeBoundaries() {
  const dispatch = useDispatch<AppDispatch>();
  const { gradeScales, loading, loadError } = useSelector(
    (state: RootState) => state.grades
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
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

  // Gaps can't stop a card, but a percentage in one takes the band below it
  const gaps = React.useMemo(() => {
    if (sorted.length === 0) return [];
    const ascending = [...sorted].reverse();
    const found: string[] = [];
    if (ascending[0].minPercentage > 0) {
      found.push(`0 to ${ascending[0].minPercentage}`);
    }
    ascending.slice(1).forEach((band, i) => {
      const below = ascending[i];
      if (band.minPercentage - below.maxPercentage > 0.01001) {
        found.push(`${below.maxPercentage} to ${band.minPercentage}`);
      }
    });
    if (sorted[0].maxPercentage < 100) {
      found.push(`${sorted[0].maxPercentage} to 100`);
    }
    return found;
  }, [sorted]);

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
    setSubmitting(true);
    const result = editing
      ? await dispatch(
          editGradeScale({ externalId: editing.externalId, data: payload })
        )
      : await dispatch(addGradeScale(payload));
    setSubmitting(false);

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
    <Stack spacing={2}>
      {loadError && (
        <LoadError
          message={loadError}
          onRetry={() => dispatch(fetchGradeScales())}
        />
      )}
      {gaps.length > 0 && (
        <Alert severity="warning">
          These percentages have no band: {gaps.join(', ')}. A student there
          gets the band below.
        </Alert>
      )}

      <Card sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Typography variant="body2">
            The lowest band prints FAIL on the card.
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ flex: 'none' }}
            onClick={openAddForm}
          >
            Add band
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grade</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Remarks on the card</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.externalId}>
                  <TableCell sx={{ fontWeight: 700 }}>{row.grade}</TableCell>
                  <TableCell>{row.minPercentage}%</TableCell>
                  <TableCell>{row.maxPercentage}%</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>{row.remarks}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label={`Edit ${row.grade}`}
                        onClick={() => openEditForm(row)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        aria-label={`Delete ${row.grade}`}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && !loadError && sorted.length === 0 && (
          <EmptyState
            title="No grade bands yet"
            detail="Cards need grade bands to work out each grade."
          />
        )}
      </Card>

      <FormPanel open={formOpen} label="Grade band">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogTitle>
            {editing ? 'Edit grade band' : 'Add grade band'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="Grade"
                slotProps={{ htmlInput: { maxLength: 5 } }}
                value={form.grade}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, grade: e.target.value }))
                }
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="From %"
                  type="number"
                  fullWidth
                  value={form.minPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minPercentage: Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 0, max: 100 } }}
                />
                <TextField
                  label="To %"
                  type="number"
                  fullWidth
                  value={form.maxPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxPercentage: Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 0, max: 100 } }}
                />
              </Stack>
              <TextField
                label="Remarks on the card"
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {editing ? 'Save changes' : 'Add band'}
            </Button>
          </DialogActions>
        </form>
      </FormPanel>

      <DeleteDialog
        open={!!deleteTarget}
        title="Delete grade band?"
        subtitle={`You are about to delete "${deleteTarget?.grade ?? ''}".`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
