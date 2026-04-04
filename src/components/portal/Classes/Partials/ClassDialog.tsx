import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { Class, ClassFormValues } from '../@types/class.d';

interface Props {
  open: boolean;
  initial: Class | null;
  onClose: () => void;
  onSave: (values: ClassFormValues) => void;
}

export default function ClassDialog({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
    } else {
      setName('');
    }
  }, [initial, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'Edit Class' : 'Add New Class'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Class Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          {initial ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
