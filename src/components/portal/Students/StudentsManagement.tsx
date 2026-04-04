import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Chip,
  Stack,
  InputAdornment,
  Card,
  CardHeader,
  Divider,
  CardContent,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../redux/store';
import {
  fetchStudents,
  addStudent,
  editStudent,
  removeStudent,
} from '../../../redux/slices/studentSlice';
import type { ClassLevel } from '../../../@types/global.d';
import type { Student, StudentFormValues } from './@types/student.d';
import { ClassLevels } from '../../../config/constants';
import StudentModal from './Partials/StudentModal';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

import {
  MoreVert as MenuIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  LibraryBooks as SubjectIcon,
} from '@mui/icons-material';
import DropdownMenu from '../../../common/DropdownMenu/DropdownMenu';

const StudentsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students: rows, loading } = useSelector(
    (state: RootState) => state.students
  );

  const [dialogMode, setDialogMode] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [editingRow, setEditingRow] = useState<Student | null>(null);
  const [rowToDelete, setRowToDelete] = useState<Student | null>(null);

  // filters
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<ClassLevel | 'All'>('All');
  // Load data on mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // derived rows based on filters
  const filtered = useMemo(() => {
    let filteredRows = rows;
    if (gradeFilter !== 'All') {
      filteredRows = filteredRows.filter((r) => r.class?.name === gradeFilter);
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
  }, [rows, search, gradeFilter]);

  const openCreate = () => {
    setDialogMode('create');
    setEditingRow(null);
  };

  const openEdit = (row: Student) => {
    setDialogMode('edit');
    setEditingRow(row);
  };

  const handleSubmit = (payload: StudentFormValues) => {
    if (dialogMode === 'create') {
      dispatch(addStudent(payload));
    } else if (editingRow) {
      dispatch(
        editStudent({ externalId: editingRow.externalId, data: payload })
      );
    }
    setDialogMode(null);
  };

  const askDelete = (row: Student) => {
    setRowToDelete(row);
    setDialogMode('delete');
  };
  const confirmDelete = () => {
    if (rowToDelete) {
      dispatch(removeStudent(rowToDelete.externalId));
    }
    setDialogMode(null);
    setRowToDelete(null);
  };

  const columns = useMemo<GridColDef<Student>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Student Name',
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => {
          return (
            <span>
              {row.firstName} {row.lastName ?? ''}
            </span>
          );
        },
      },
      {
        field: 'fatherName',
        headerName: 'Father Name',
        flex: 1.2,
        minWidth: 200,
        sortable: false,
      },
      {
        field: 'rollNumber',
        headerName: 'Roll #',
        width: 120,
      },
      {
        field: 'class',
        headerName: 'Class',
        width: 110,
        valueGetter: (_value, row) => row.class?.name || '-',
      },
      {
        field: 'contactNo',
        headerName: 'Contact',
        flex: 1,
        minWidth: 200,
        sortable: false,
        align: 'center',
        renderCell: (params: GridRenderCellParams<any, Student>) => (
          <Typography variant="caption" color="text.secondary">
            {params.row.contactNo ? params.row.contactNo : '-'}
          </Typography>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams<any, Student>) => (
          <Typography variant="caption" color="text.secondary">
            {params.row.email ? params.row.email : '---'}
          </Typography>
        ),
      },
      {
        field: 'subjects',
        headerName: 'Subjects',
        width: 120,
        renderCell: (p) => (
          <Chip
            label={`${p.row.subjects?.length ?? 0}`}
            size="small"
            color={(p.row.subjects?.length ?? 0) > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        sortable: false,
        filterable: false,
        align: 'center',
        renderCell: (params) => {
          const row = params.row;
          return (
            <DropdownMenu icon={<MenuIcon fontSize="small" />}>
              <Tooltip title="Assign Subjects (coming soon)">
                <MenuItem>
                  <SubjectIcon fontSize="small" sx={{ mr: 1 }} />
                  Assign Subjects
                </MenuItem>
              </Tooltip>
              <Tooltip title="Edit">
                <MenuItem onClick={() => openEdit(row)}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
              </Tooltip>

              <Tooltip title="Delete">
                <MenuItem onClick={() => askDelete(row)}>
                  <DeleteIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Tooltip>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      {/* Header Section */}
      <Card>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <CardHeader
            title="Students Management"
            subheader="Create, edit and manage student records"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Student
          </Button>
        </Stack>
        <Divider />
        <CardContent>
          {/* Actions / Filters */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <TextField
              placeholder="Search name, father name, roll #, phone, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="ClassLevel"
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value as ClassLevel | 'All')
              }
              sx={{ width: { xs: '100%', sm: 180 } }}
            >
              <MenuItem value="All">All</MenuItem>
              {ClassLevels.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
            <Box flex={1} />
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'background.secondary',
            },
          }}
        />
      </Box>

      {/* Create/Edit dialog */}
      <StudentModal
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onClose={() => setDialogMode(null)}
        onSubmit={handleSubmit}
        mode={dialogMode === 'create' ? 'create' : 'edit'}
        initial={editingRow ?? undefined}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={dialogMode === 'delete'}
        title="Delete student?"
        subtitle={`You are about to delete "${rowToDelete?.firstName ?? ''}${
          rowToDelete?.lastName ? ' ' + rowToDelete.lastName : ''
        }" (Roll ${rowToDelete?.rollNumber ?? ''}).`}
        onCancel={() => setDialogMode(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default StudentsManagement;
