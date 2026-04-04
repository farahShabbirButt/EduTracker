import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../redux/store';
import {
  fetchClasses,
  addClass,
  editClass,
  removeClass,
} from '../../../redux/slices/classSlice';
import type { Class, ClassFormValues } from './@types/class.d';
import ClassListing from './Partials/ClassListing';
import ClassDialog from './Partials/ClassDialog';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

export default function ClassesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, loading } = useSelector((state: RootState) => state.classes);

  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  useEffect(() => {
    dispatch(fetchClasses());
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

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      dispatch(removeClass(classToDelete.externalId));
      setClassToDelete(null);
    }
  };

  const handleSave = (values: ClassFormValues) => {
    if (editingClass) {
      dispatch(
        editClass({ externalId: editingClass.externalId, data: values })
      );
    } else {
      dispatch(addClass(values));
    }
    setOpenDialog(false);
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Classes Management"
          subheader="Manage school classes and levels"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Add Class
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <ClassListing
        rows={filteredClasses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteAsk}
      />

      <ClassDialog
        open={openDialog}
        initial={editingClass}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!classToDelete}
        title="Delete Class?"
        subtitle={`Are you sure you want to delete class "${classToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setClassToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
}
