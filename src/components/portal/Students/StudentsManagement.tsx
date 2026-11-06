import {
  Avatar,
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Tooltip,
  Skeleton,
  Stack,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import LoadError from '../../../common/LoadError';
import EmptyState from '../../../common/EmptyState';
import type { GridColDef } from '@mui/x-data-grid';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState, AppDispatch } from '../../../redux/store';
import {
  fetchStudents,
  addStudent,
  editStudent,
  removeStudent,
} from '../../../redux/slices/studentSlice';
import { fetchClasses } from '../../../redux/slices/classSlice';
import type { Student, StudentFormValues } from './@types/student.d';
import StudentModal from './Partials/StudentModal';
import { useSearchParams } from 'react-router-dom';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';

// Rows shown at a time on a phone
const PHONE_PAGE = 20;

// Numbers in order: 2 before 10, 9th before 10th
const registerOrder = (a: unknown, b: unknown) =>
  String(a).localeCompare(String(b), undefined, { numeric: true });

const NoStudents = () => (
  <EmptyState
    title="No students to show"
    detail="Add a student, or change the search and class filter."
  />
);

const StudentsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));
  const [shown, setShown] = useState(PHONE_PAGE);
  const {
    students: rows,
    loading,
    loadError,
  } = useSelector((state: RootState) => state.students);
  const { classes } = useSelector((state: RootState) => state.classes);

  const [dialogMode, setDialogMode] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [editingRow, setEditingRow] = useState<Student | null>(null);
  const [rowToDelete, setRowToDelete] = useState<Student | null>(null);

  // filters
  const [searchParams, setSearchParams] = useSearchParams();
  // Set when someone picks a student in the header's search
  const picked = searchParams.get('student');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  // Load data on mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (classes.length === 0) {
      dispatch(fetchClasses());
    }
  }, [dispatch, classes.length]);

  // derived rows based on filters
  const filtered = useMemo(() => {
    if (picked) {
      return rows.filter((r) => r.externalId === picked);
    }
    let filteredRows = rows;
    if (classFilter !== 'All') {
      filteredRows = filteredRows.filter(
        (r) => r.class?.externalId === classFilter
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      filteredRows = filteredRows.filter((r) => {
        const fullName = [r.firstName, r.lastName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const father = (r.fatherName ?? '').toLowerCase();
        return (
          fullName.includes(q) ||
          father.includes(q) ||
          r.rollNumber.toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          (r.contactNo ?? '').toLowerCase().includes(q)
        );
      });
    }
    return filteredRows;
  }, [rows, search, classFilter, picked]);

  const openCreate = () => {
    setDialogMode('create');
    setEditingRow(null);
  };

  const openEdit = (row: Student) => {
    setDialogMode('edit');
    setEditingRow(row);
  };

  const handleSubmit = async (payload: StudentFormValues) => {
    const result =
      dialogMode === 'edit' && editingRow
        ? await dispatch(
            editStudent({ externalId: editingRow.externalId, data: payload })
          )
        : await dispatch(addStudent(payload));

    if (
      addStudent.fulfilled.match(result) ||
      editStudent.fulfilled.match(result)
    ) {
      toast.success(result.payload.message);
      setDialogMode(null);
    } else {
      // Dialog stays open so the typed values aren't lost
      toast.error((result.payload as string) || 'Failed to save student');
    }
  };

  const askDelete = (row: Student) => {
    setRowToDelete(row);
    setDialogMode('delete');
  };
  const confirmDelete = async () => {
    if (!rowToDelete) return;
    const result = await dispatch(removeStudent(rowToDelete.externalId));
    if (removeStudent.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to delete student');
    }
    setDialogMode(null);
    setRowToDelete(null);
  };

  const fullName = (row: Student) =>
    [row.firstName, row.lastName].filter(Boolean).join(' ');

  const actions = (row: Student) => (
    <>
      <Tooltip title="Edit">
        <IconButton
          aria-label={`Edit ${fullName(row)}`}
          onClick={() => openEdit(row)}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          color="error"
          aria-label={`Delete ${fullName(row)}`}
          onClick={() => askDelete(row)}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  const nameCell = (row: Student) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Avatar
        sx={(theme) => ({
          width: 36,
          height: 36,
          fontSize: 13,
          fontWeight: 800,
          bgcolor: 'background.accent',
          color: theme.palette.studio.tintInk,
        })}
      >
        {row.firstName.charAt(0).toUpperCase()}
      </Avatar>
      <Typography noWrap sx={{ fontWeight: 700 }}>
        {fullName(row)}
      </Typography>
    </Box>
  );

  const columns: GridColDef<Student>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Student',
        flex: 1.3,
        minWidth: 200,
        display: 'flex',
        valueGetter: (_value, row) => fullName(row),
        renderCell: ({ row }) => nameCell(row),
      },
      {
        field: 'fatherName',
        headerName: 'Father',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'rollNumber',
        headerName: 'Roll',
        width: 110,
        sortComparator: registerOrder,
      },
      {
        field: 'class',
        headerName: 'Class',
        width: 130,
        sortComparator: registerOrder,
        valueGetter: (_value, row) => row.class?.name || '-',
      },
      {
        field: 'subjects',
        headerName: 'Subjects',
        width: 100,
        valueGetter: (_value, row) => row.subjects?.length ?? 0,
      },
      {
        field: 'contactNo',
        headerName: 'Contact',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => row.contactNo || '-',
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1.2,
        minWidth: 170,
        valueGetter: (_value, row) => row.email || '-',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 110,
        display: 'flex',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        renderCell: ({ row }) => actions(row),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          size="small"
          placeholder="Search name, father, roll, phone or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShown(PHONE_PAGE);
            if (picked) setSearchParams({});
          }}
          fullWidth
          slotProps={{
            htmlInput: { 'aria-label': 'Search students' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Class"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setShown(PHONE_PAGE);
            if (picked) setSearchParams({});
          }}
          sx={{ width: { xs: '100%', sm: 200 }, flex: 'none' }}
        >
          <MenuItem value="All">All classes</MenuItem>
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ flex: 'none' }}
        >
          Add student
        </Button>
      </Stack>

      {picked && (
        <Box>
          <Chip
            label="Showing the student you found"
            onDelete={() => setSearchParams({})}
          />
        </Box>
      )}

      {loadError && (
        <LoadError
          message={loadError}
          onRetry={() => dispatch(fetchStudents())}
        />
      )}

      {loadError ? null : phone ? (
        <Card sx={{ px: 2, py: 0.5 }}>
          {filtered.slice(0, shown).map((row, index) => (
            <Box
              key={row.externalId}
              sx={{ py: 1.5, borderTop: index ? 1 : 0, borderColor: 'divider' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>{nameCell(row)}</Box>
                <Box sx={{ flex: 'none' }}>{actions(row)}</Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.hint', mt: 0.5 }}>
                {[row.class?.name, `Roll ${row.rollNumber}`, row.contactNo]
                  .filter(Boolean)
                  .join(', ')}
              </Typography>
            </Box>
          ))}
          {loading && filtered.length === 0 && (
            <Skeleton variant="rounded" height={64} sx={{ my: 1 }} />
          )}
          {!loading && !loadError && filtered.length === 0 && (
            <EmptyState
              title={rows.length ? 'No students match' : 'No students yet'}
              detail={
                rows.length
                  ? 'Check the spelling or the class filter.'
                  : 'Add your first student to get started.'
              }
            />
          )}
          {filtered.length > shown && (
            <Box sx={{ textAlign: 'center', py: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShown((n) => n + PHONE_PAGE)}
              >
                Show more
              </Button>
            </Box>
          )}
        </Card>
      ) : (
        <Card sx={{ px: 1 }}>
          <DataGrid
            autoHeight
            rows={filtered}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.externalId}
            disableRowSelectionOnClick
            rowHeight={60}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            slots={{ noRowsOverlay: NoStudents }}
          />
        </Card>
      )}

      {/* Create/Edit dialog */}
      <StudentModal
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onClose={() => setDialogMode(null)}
        onSubmit={handleSubmit}
        mode={editingRow ? 'edit' : 'create'}
        initial={editingRow ?? undefined}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={dialogMode === 'delete'}
        title="Delete student?"
        subtitle={`Deleting ${rowToDelete?.firstName ?? ''} ${rowToDelete?.lastName ?? ''} (Roll ${rowToDelete?.rollNumber ?? ''}) also removes their marks and result card, and this can't be undone. Positions in their class may change.`}
        onCancel={() => setDialogMode(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
};

export default StudentsManagement;
