import * as React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import {
  fetchSubjects,
  addSubject,
  editSubject,
  removeSubject,
} from '../../../redux/slices/subjectSlice';
import { fetchClasses } from '../../../redux/slices/classSlice';
import type { ApiSubject, SubjectFormValues } from './@types/subject.d';
import SubjectListing from './Partial/SubjectsListing';
import SubjectDialog from './Partial/SubjectsDialog';
import AssignToClasses from './Partial/AssignToClasses';
import GradeBoundaries from './Partial/GradeBoundries';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';
import LoadError from '../../../common/LoadError';
import LabeledSelect from '../../../common/Form/LabeledSelect';

export default function SubjectsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { subjects, loading, loadError } = useSelector(
    (state: RootState) => state.subjects
  );
  const { classes } = useSelector((state: RootState) => state.classes);

  const [classFilter, setClassFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [dialogMode, setDialogMode] = React.useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [activeSubject, setActiveSubject] = React.useState<ApiSubject | null>(
    null
  );
  const [openAssign, setOpenAssign] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'grades' ? 'grades' : 'subjects';

  React.useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchClasses());
  }, [dispatch]);

  const filtered = React.useMemo(() => {
    let rows = subjects;
    if (classFilter) {
      rows = rows.filter((s) =>
        s.classes?.some((c) => c.externalId === classFilter)
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((s) => s.name.toLowerCase().includes(q));
    }
    return rows;
  }, [subjects, classFilter, search]);

  const openCreate = () => {
    setDialogMode('create');
    setActiveSubject(null);
  };

  const openEdit = (row: ApiSubject) => {
    setDialogMode('edit');
    setActiveSubject(row);
  };

  const handleSave = async (data: SubjectFormValues) => {
    const result =
      dialogMode === 'edit' && activeSubject
        ? await dispatch(
            editSubject({ externalId: activeSubject.externalId, data })
          )
        : await dispatch(addSubject(data));

    if (
      addSubject.fulfilled.match(result) ||
      editSubject.fulfilled.match(result)
    ) {
      toast.success(result.payload.message);
      setDialogMode(null);
      setActiveSubject(null);
    } else {
      toast.error((result.payload as string) || 'Failed to save subject');
    }
  };

  const askDelete = (row: ApiSubject) => {
    setActiveSubject(row);
    setDialogMode('delete');
  };

  const confirmDelete = async () => {
    if (!activeSubject) return;
    const result = await dispatch(removeSubject(activeSubject.externalId));
    if (removeSubject.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to delete subject');
    }
    setDialogMode(null);
    setActiveSubject(null);
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        alignItems={{ lg: 'flex-end' }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) =>
            setSearchParams(value === 'grades' ? { tab: 'grades' } : {})
          }
        >
          <Tab value="subjects" label="Subjects" />
          <Tab value="grades" label="Grade boundaries" />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        {tab === 'subjects' && (
          <>
            <TextField
              size="small"
              placeholder="Search subjects"
              sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
              slotProps={{ htmlInput: { 'aria-label': 'Search subjects' } }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <LabeledSelect
              label="Class"
              placeholder="All classes"
              value={classFilter}
              minWidth={170}
              options={Object.fromEntries(
                classes.map((c) => [c.externalId, c.name])
              )}
              onChange={setClassFilter}
            >
              <MenuItem value="">All classes</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.externalId} value={c.externalId}>
                  {c.name}
                </MenuItem>
              ))}
            </LabeledSelect>
            <Button
              variant="outlined"
              sx={{ flex: 'none' }}
              onClick={() => setOpenAssign(true)}
            >
              Assign to classes
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ flex: 'none' }}
              onClick={openCreate}
            >
              Add subject
            </Button>
          </>
        )}
      </Stack>

      {tab === 'grades' ? (
        <GradeBoundaries />
      ) : (
        <>
          {loadError && (
            <LoadError
              message={loadError}
              onRetry={() => dispatch(fetchSubjects())}
            />
          )}
          {!loadError && (
            <SubjectListing
              rows={filtered}
              loading={loading}
              onEdit={openEdit}
              onDelete={askDelete}
            />
          )}
        </>
      )}

      {/* Create/Edit */}
      <SubjectDialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        initial={dialogMode === 'edit' ? activeSubject : undefined}
        onCancel={() => {
          setDialogMode(null);
          setActiveSubject(null);
        }}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={dialogMode === 'delete'}
        title="Delete subject?"
        subtitle={`You are about to delete "${activeSubject?.name ?? ''}".`}
        onCancel={() => {
          setDialogMode(null);
          setActiveSubject(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* Assign */}
      <AssignToClasses
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        allSubjects={subjects}
      />
    </Stack>
  );
}
