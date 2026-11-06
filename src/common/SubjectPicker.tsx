import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { ApiSubject } from '../components/portal/Subjects/@types/subject.d';

// A tick list that stays open, because a class takes many subjects at once
export default function SubjectPicker({
  subjects,
  selected,
  onChange,
}: {
  subjects: ApiSubject[];
  selected: string[];
  onChange: (externalIds: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const shown = subjects.filter((s) => s.name.toLowerCase().includes(query));
  const shownIds = shown.map((s) => s.externalId);
  const allShown = shownIds.every((id) => selected.includes(id));

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((other) => other !== id)
        : [...selected, id]
    );

  const toggleAll = () =>
    onChange(
      allShown
        ? selected.filter((id) => !shownIds.includes(id))
        : [...new Set([...selected, ...shownIds])]
    );

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Subjects ({selected.length} selected)
        </Typography>
        {shown.length > 0 && (
          <Button size="small" variant="outlined" onClick={toggleAll}>
            {allShown ? 'Clear all' : 'Select all'}
          </Button>
        )}
      </Box>
      <TextField
        size="small"
        placeholder="Search subjects"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        // Enter here mustn't save the form around the picker
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
        slotProps={{
          htmlInput: { 'aria-label': 'Search subjects' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <List
        dense
        disablePadding
        aria-label="Subjects"
        sx={(theme) => ({
          maxHeight: { md: 'calc(100vh - 380px)' },
          overflowY: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: `${theme.studio.radii.medium}px`,
        })}
      >
        {shown.map((subject) => (
          <ListItemButton
            key={subject.externalId}
            role="checkbox"
            aria-checked={selected.includes(subject.externalId)}
            onClick={() => toggle(subject.externalId)}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                checked={selected.includes(subject.externalId)}
                slotProps={{ input: { 'aria-hidden': true } }}
              />
            </ListItemIcon>
            <ListItemText
              primary={subject.name}
              secondary={`Out of ${subject.maxMarks}`}
            />
            {subject.subjectType === 'ELECTIVE' && (
              <Chip size="small" label="Elective" />
            )}
          </ListItemButton>
        ))}
        {shown.length === 0 && (
          <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
            {subjects.length ? 'No subjects match' : 'Add subjects first'}
          </Typography>
        )}
      </List>
    </Stack>
  );
}
