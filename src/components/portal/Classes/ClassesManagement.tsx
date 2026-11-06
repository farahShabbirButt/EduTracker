import { useState, useEffect } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState, AppDispatch } from '../../../redux/store';
import {
  fetchClasses,
  addClass,
  editClass,
  removeClass,
} from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import { fetchSubjects } from '../../../redux/slices/subjectSlice';
import type { Class, ClassFormValues } from './@types/class.d';
import AssignToClasses from '../Subjects/Partial/AssignToClasses';
import ClassListing from './Partials/ClassListing';
import ClassDialog from './Partials/ClassDialog';
import LoadError from '../../../common/LoadError';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

export default function ClassesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, loading, loadError } = useSelector(
    (state: RootState) => state.classes
  );
  const {
    students,
    loading: studentsLoading,
    loadError: studentsError,
  } = useSelector((state: RootState) => state.students);
  const {
    subjects,
    loading: subjectsLoading,
    loadError: subjectsError,
  } = useSelector((state: RootState) => state.subjects);
  const [assignClass, setAssignClass] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingClass(null);
    setOpenDialog(true);
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setOpenDialog(true);
  };

  const handleDeleteAsk = (cls: Class) => {
    setClassToDelete(cls);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    const result = await dispatch(removeClass(classToDelete.externalId));
    if (removeClass.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to delete class');
    }
    setClassToDelete(null);
  };

  const handleSave = async (values: ClassFormValues) => {
    const result = editingClass
      ? await dispatch(
          editClass({ externalId: editingClass.externalId, data: values })
        )
      : await dispatch(addClass(values));

    if (addClass.fulfilled.match(result) || editClass.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setOpenDialog(false);
    } else {
      // Dialog stays open so the typed name isn't lost
      toast.error((result.payload as string) || 'Failed to save class');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Search classes"
          slotProps={{ htmlInput: { 'aria-label': 'Search classes' } }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ flex: 'none' }}
        >
          Add class
        </Button>
      </Stack>

      {loadError && (
        <LoadError
          message={loadError}
          onRetry={() => dispatch(fetchClasses())}
        />
      )}

      {studentsError && (
        <LoadError
          message={studentsError}
          onRetry={() => dispatch(fetchStudents())}
        />
      )}

      {subjectsError && (
        <LoadError
          message={subjectsError}
          onRetry={() => dispatch(fetchSubjects())}
        />
      )}

      <ClassListing
        rows={filteredClasses}
        loading={loading}
        searching={search.trim() !== ''}
        failed={Boolean(loadError)}
        countsReady={
          !studentsLoading &&
          !subjectsLoading &&
          !studentsError &&
          !subjectsError
        }
        studentCount={(cls) =>
          students.filter((s) => s.class?.externalId === cls.externalId).length
        }
        subjectCount={(cls) =>
          subjects.filter((s) =>
            s.classes?.some((c) => c.externalId === cls.externalId)
          ).length
        }
        onEdit={handleEdit}
        onDelete={handleDeleteAsk}
        onAssign={(cls) => setAssignClass(cls.externalId)}
      />

      <AssignToClasses
        open={assignClass !== null}
        initialClassId={assignClass ?? undefined}
        onClose={() => setAssignClass(null)}
        allSubjects={subjects}
      />

      <ClassDialog
        open={openDialog}
        initial={editingClass}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!classToDelete}
        title="Delete class?"
        subtitle={`Are you sure you want to delete class "${classToDelete?.name}"? A class with students or marks can't be deleted. This action cannot be undone.`}
        onCancel={() => setClassToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
}
