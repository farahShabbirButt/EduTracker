import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import { IconButton, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Class } from '../@types/class';

interface Props {
  rows: Class[];
  loading: boolean;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
}

export default function ClassListing({
  rows,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns: GridColDef<Class>[] = [
    {
      field: 'name',
      headerName: 'Class Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'externalId',
      headerName: 'External ID',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams<Class>) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => onDelete(params.row)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%', bgcolor: 'background.paper' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.externalId}
        pageSizeOptions={[5, 10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
