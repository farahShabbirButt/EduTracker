import { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { ApiSubject } from '../@types/subject.d';
import EmptyState from '../../../../common/EmptyState';

type Props = {
  rows: ApiSubject[];
  loading?: boolean;
  onEdit: (row: ApiSubject) => void;
  onDelete: (row: ApiSubject) => void;
};

const TypeChip = ({ type }: { type: string }) => {
  const compulsory = type === 'COMPULSORY';
  return (
    <Chip
      size="small"
      label={compulsory ? 'Compulsory' : 'Elective'}
      sx={(theme) => ({
        bgcolor: compulsory
          ? theme.palette.studio.greenSoft
          : theme.palette.studio.amberSoft,
        color: compulsory
          ? theme.palette.studio.greenInk
          : theme.palette.studio.amberInk,
      })}
    />
  );
};

const NoSubjects = () => (
  <EmptyState
    title="No subjects to show"
    detail="Add a subject, or change the search and class filter."
  />
);

const classNames = (row: ApiSubject) =>
  row.classes?.map((c) => c.name).join(', ') || 'Not assigned';

export default function SubjectListing({
  rows,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));

  const actions = (row: ApiSubject) => (
    <>
      <Tooltip title="Edit">
        <IconButton aria-label={`Edit ${row.name}`} onClick={() => onEdit(row)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          color="error"
          aria-label={`Delete ${row.name}`}
          onClick={() => onDelete(row)}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  const columns = useMemo<GridColDef<ApiSubject>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Subject',
        flex: 1,
        minWidth: 180,
        display: 'flex',
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
        ),
      },
      { field: 'maxMarks', headerName: 'Max marks', width: 120 },
      {
        field: 'subjectType',
        headerName: 'Type',
        width: 140,
        display: 'flex',
        renderCell: ({ row }) => <TypeChip type={row.subjectType} />,
      },
      {
        field: 'classes',
        headerName: 'Assigned classes',
        flex: 1,
        minWidth: 200,
        valueGetter: (_value, row) => classNames(row),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 110,
        display: 'flex',
        align: 'right',
        renderCell: ({ row }) => actions(row),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdit, onDelete]
  );

  if (phone) {
    return (
      <Card sx={{ px: 2, py: 0.5 }}>
        {rows.map((row, index) => (
          <Box
            key={row.externalId}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              py: 1.5,
              borderTop: index ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.hint', mb: 0.5 }}>
                Out of {row.maxMarks}, {classNames(row)}
              </Typography>
              <TypeChip type={row.subjectType} />
            </Box>
            <Box sx={{ flex: 'none' }}>{actions(row)}</Box>
          </Box>
        ))}
        {loading && rows.length === 0 && (
          <Skeleton variant="rounded" height={64} sx={{ my: 1 }} />
        )}
        {!loading && rows.length === 0 && <NoSubjects />}
      </Card>
    );
  }

  return (
    <Card sx={{ px: 1 }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={!!loading}
        disableRowSelectionOnClick
        rowHeight={60}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        getRowId={(r) => r.externalId}
        slots={{ noRowsOverlay: NoSubjects }}
      />
    </Card>
  );
}
