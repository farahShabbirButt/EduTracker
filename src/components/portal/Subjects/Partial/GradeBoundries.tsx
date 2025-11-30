// src/components/subjects/GradeBoundariesDialog.tsx
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { GradeBoundary } from '../@types/subject';

type Props = {
  open: boolean;
  initial?: GradeBoundary[];
  onClose: () => void;
  onSave: (boundaries: GradeBoundary[]) => void;
};

export default function GradeBoundariesDialog({
  open,
  initial,
  onClose,
  onSave,
}: Props) {
  const [rows, setRows] = React.useState<GradeBoundary[]>(
    initial?.length
      ? initial
      : [
          { label: 'A+', min: 90 },
          { label: 'A', min: 80 },
          { label: 'B+', min: 70 },
          { label: 'B', min: 60 },
          { label: 'C', min: 50 },
          { label: 'D', min: 40 },
          { label: 'F', min: 0 },
        ]
  );

  React.useEffect(() => {
    if (initial && initial.length) setRows(initial);
  }, [initial]);

  const setRow = (i: number, patch: Partial<GradeBoundary>) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );
  const addRow = () => setRows((prev) => [...prev, { label: '', min: 0 }]);
  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const validate = (): string | null => {
    const labels = new Set<string>();
    for (const r of rows) {
      if (!r.label.trim()) return 'All labels are required.';
      const key = r.label.trim().toUpperCase();
      if (labels.has(key)) return 'Labels must be unique.';
      labels.add(key);
      if (Number.isNaN(r.min) || r.min < 0 || r.min > 100)
        return 'Minimum % must be between 0 and 100.';
    }
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    const sorted = [...rows].sort((a, b) => b.min - a.min);
    onSave(sorted);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Grade Boundaries</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {rows.map((r, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Label"
                value={r.label}
                onChange={(e) => setRow(i, { label: e.target.value })}
                sx={{ width: 160 }}
              />
              <TextField
                label="Min %"
                type="number"
                value={r.min}
                onChange={(e) => setRow(i, { min: Number(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 140 }}
              />
              <Tooltip title="Remove">
                <IconButton color="error" onClick={() => removeRow(i)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
          <Button startIcon={<AddIcon />} onClick={addRow}>
            Add Grade
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
