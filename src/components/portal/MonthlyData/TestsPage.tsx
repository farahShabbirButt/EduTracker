import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Card, MenuItem, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TestListTable, { type TestFilter } from './TestTab/TestListTable';
import TestModal from './TestTab/TestModal';
import FormPanel from '../../../common/FormPanel';
import FilterBar from '../../../common/FilterBar';
import LabeledSelect from '../../../common/Form/LabeledSelect';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { TestType } from '../../../@types/global.d';

const TYPES = { all: 'All types', monthly: 'Monthly', session: 'Test session' };

export default function TestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const classes = useSelector((state: RootState) => state.classes.classes);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editTestId, setEditTestId] = useState<string | null>(null);

  // Kept in the address, so going back from Marks entry keeps them
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get('class') ?? 'all';
  const typeParam = searchParams.get('type');
  const type: keyof typeof TYPES =
    typeParam === 'monthly' || typeParam === 'session' ? typeParam : 'all';

  const setFilter = (key: 'class' | 'type', value: string) => {
    setSearchParams(
      (current) => {
        // Change a copy, not the router's own object
        const params = new URLSearchParams(current);
        if (value === 'all') params.delete(key);
        else params.set(key, value);
        return params;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (classes.length === 0) dispatch(fetchClasses());
  }, [dispatch, classes.length]);

  const filter: TestFilter = {
    classId: classId === 'all' ? null : classId,
    testType:
      type === 'monthly'
        ? TestType.MONTHLY
        : type === 'session'
          ? TestType.SESSION
          : null,
  };

  const handleAddTest = () => {
    setEditTestId(null);
    setOpenCreateModal(true);
  };

  const handleEditTest = (id: string) => {
    setEditTestId(id);
    setOpenCreateModal(true);
  };

  return (
    <Stack spacing={2}>
      <FilterBar>
        <LabeledSelect
          label="Class"
          value={classId}
          options={{
            all: 'All classes',
            ...Object.fromEntries(classes.map((c) => [c.externalId, c.name])),
          }}
          onChange={(value) => setFilter('class', value)}
        >
          <MenuItem value="all">All classes</MenuItem>
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Type"
          value={type}
          options={TYPES}
          onChange={(value) => setFilter('type', value)}
        >
          {Object.entries(TYPES).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </LabeledSelect>
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTest}
          sx={{ flex: 'none' }}
        >
          New test
        </Button>
      </FilterBar>
      <Card sx={{ p: 1.5 }}>
        <TestListTable
          filter={filter}
          onEditTest={handleEditTest}
          onClearFilter={() => setSearchParams({}, { replace: true })}
        />
      </Card>

      <FormPanel open={openCreateModal} label="Test details">
        <Box sx={{ p: 3, overflow: 'auto' }}>
          <TestModal
            onClose={() => setOpenCreateModal(false)}
            editTestId={editTestId}
          />
        </Box>
      </FormPanel>
    </Stack>
  );
}
