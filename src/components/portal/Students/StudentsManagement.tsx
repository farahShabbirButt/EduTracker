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

import type { ClassLevel } from '../../../@types/global.d';
import type { Student, StudentFormValues } from './@types/student.d';
import { ClassLevels, StudentsSampleData } from '../../../config/constants';
import StudentModal from './Partials/StudentModal';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';
import { useMemo, useState } from 'react';

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
  // state
  const [rows, setRows] = useState<Student[]>(StudentsSampleData);
  const [dialogMode, setDialogMode] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [editingRow, setEditingRow] = useState<Student | null>(null);
  const [rowToDelete, setRowToDelete] = useState<Student | null>(null);

  // filters
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<ClassLevel | 'All'>('All');

  // derived rows based on filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesGrade = gradeFilter === 'All' || r.grade === gradeFilter;
      const fullName = [r.firstName, r.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const father = (r.fatherName ?? '').toLowerCase();
      const matchQ =
        !q ||
        fullName.includes(q) ||
        father.includes(q) ||
        r.rollNumber.toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q) ||
        (r.phone ?? '').toLowerCase().includes(q);
      return matchesGrade && matchQ;
    });
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
      const newRow: Student = {
        id: `s-${Date.now()}`,
        ...payload,
        subjectsAssigned: [],
      };
      setRows((p) => [newRow, ...p]);
    } else if (editingRow) {
      setRows((p) =>
        p.map((r) => (r.id === editingRow.id ? { ...r, ...payload } : r))
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
      setRows((p) => p.filter((r) => r.id !== rowToDelete.id));
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
        field: 'grade',
        headerName: 'ClassLevel',
        width: 110,
      },
      {
        field: 'phone',
        headerName: 'Contact',
        flex: 1,
        minWidth: 200,
        sortable: false,
        align: 'center',
        renderCell: (params: GridRenderCellParams<any, Student>) => (
          <Typography variant="caption" color="text.secondary">
            {params.row.phone ? params.row.phone : '-'}
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
        field: 'subjectsAssigned',
        headerName: 'Subjects',
        width: 120,
        renderCell: (p) => (
          <Chip
            label={`${p.row.subjectsAssigned?.length ?? 0}`}
            size="small"
            color={
              (p.row.subjectsAssigned?.length ?? 0) > 0 ? 'primary' : 'default'
            }
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
