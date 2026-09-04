import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
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
import GradeBoundariesDialog from './Partial/GradeBoundries';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

export default function SubjectsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { subjects, loading } = useSelector(
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
  const [openBoundaries, setOpenBoundaries] = React.useState(false);

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
      <Card>
        <CardHeader
          title="Subject Management"
          subheader="Add subjects, set max marks, and grade boundaries"
        />
        <Divider />
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Search subjects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <TextField
              select
              label="Filter by Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.externalId} value={c.externalId}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Button
              startIcon={<LinkIcon />}
              variant="outlined"
              onClick={() => setOpenAssign(true)}
            >
              Assign to Classes
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              variant="outlined"
              onClick={() => setOpenBoundaries(true)}
            >
              Grade Boundaries
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={openCreate}
            >
              Add Subject
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <SubjectListing
        rows={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={askDelete}
      />

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

      {/* Boundaries */}
      <GradeBoundariesDialog
        open={openBoundaries}
        onClose={() => setOpenBoundaries(false)}
      />
    </Stack>
  );
}
