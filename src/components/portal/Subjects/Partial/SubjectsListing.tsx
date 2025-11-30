import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { Box, MenuItem, Tooltip, Typography } from '@mui/material';
import {
  MoreVert as MenuIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { Subject } from '../@types/subject.d';
import DropdownMenu from '../../../../common/DropdownMenu/DropdownMenu';

type Props = {
  rows: Subject[];
  loading?: boolean;
  onEdit: (row: Subject) => void;
  onDelete: (row: Subject) => void;
};

export default function SubjectListing({
  rows,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns = React.useMemo<GridColDef<Subject>[]>(
    () => [
      { field: 'name', headerName: 'Subject', flex: 1, minWidth: 160 },
      {
        field: 'defaultMaxMarks',
        headerName: 'Max Marks',
        width: 130,
        renderCell: (p) => (
          <Typography variant="body2">
            {p.row.defaultMaxMarks ?? 100}
          </Typography>
        ),
      },
      {
        field: 'grades',
        headerName: 'Assigned Grades',
        flex: 1,
        minWidth: 200,
        renderCell: (p) => (
          <Typography variant="body2">
            {p.row.grades?.length ? p.row.grades.join(', ') : '—'}
          </Typography>
        ),
      },
      {
        field: 'subjectType',
        headerName: 'Subject Type',
        flex: 1,
        minWidth: 200,
        renderCell: (p) => {
          const subType = p.row.subjectType;
          const formatted =
            subType?.charAt(0) + subType?.slice(1).toLowerCase();
          return <Typography variant="body2">{formatted}</Typography>;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 110,
        renderCell: (p) => (
          <DropdownMenu icon={<MenuIcon fontSize="small" />}>
            <Tooltip title="Edit">
              <MenuItem onClick={() => onEdit(p.row)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
            </Tooltip>
            <Tooltip title="Delete">
              <MenuItem onClick={() => onDelete(p.row)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Tooltip>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <Box style={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={!!loading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        getRowId={(r) => r.id}
      />
    </Box>
  );
}
