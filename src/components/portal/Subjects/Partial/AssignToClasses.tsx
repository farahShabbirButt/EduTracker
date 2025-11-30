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
import type { ClassLevel } from '../../../../@types/global';
import type { Subject } from '../@types/subject';
import { ClassLevels } from '../../../../config/constants';

type Props = {
  open: boolean;
  allSubjects: Subject[]; // full list to choose from
  getAssignedForGrade: (grade: ClassLevel) => Subject[]; // how many already assigned
  onClose: () => void;
  onSave: (grade: ClassLevel, subjectIds: string[]) => void;
};

export default function AssignToClassesDialog({
  open,
  onClose,
  allSubjects,
  getAssignedForGrade,
  onSave,
}: Props) {
  const [grade, setGrade] = React.useState<ClassLevel>('9');
  const [selected, setSelected] = React.useState<Subject[]>([]);

  React.useEffect(() => {
    setSelected(getAssignedForGrade(grade));
  }, [grade, getAssignedForGrade]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Subjects to Grades</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Class Level"
            value={grade}
            onChange={(e) => setGrade(e.target.value as ClassLevel)}
            sx={{ width: 220 }}
          >
            {ClassLevels.map((g) => (
              <MenuItem key={g} value={g}>
                {g === 'KG' || g === 'Nursery' ? g : `ClassLevel ${g}`}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={allSubjects}
            getOptionLabel={(o) => o.name}
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
                  key={option.id}
                  label={`${option.name} (${option.defaultMaxMarks})`}
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
          onClick={() =>
            onSave(
              grade,
              selected.map((s) => s.id)
            )
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
