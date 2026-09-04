import { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  MenuItem,
  Typography,
} from '@mui/material';

import {
  MoreVert as MenuIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchTests, removeTest } from '../../../../redux/slices/testSlice';
import { MonthList } from '../../../../config/constants';
import DropdownMenu from '../../../../common/DropdownMenu/DropdownMenu';
import DeleteDialog from '../../../../common/Dialogs/DeleteDialog/DeleteDialog';
import type { ApiTest } from '../@types/testData.d';

export default function TestListTable({
  onEditTest,
}: {
  onEditTest: (externalId: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { tests, loading } = useSelector((state: RootState) => state.tests);
  const [deleteTarget, setDeleteTarget] = useState<ApiTest | null>(null);

  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);

  const monthLabel = (month: number) =>
    MonthList.find((m) => m.value === month)?.label ?? month;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(removeTest(deleteTarget.externalId));
    if (removeTest.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error((result.payload as string) || 'Failed to delete test');
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Test Name</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Month</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tests.map((t) => (
            <TableRow key={t.externalId}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.class?.name}</TableCell>
              <TableCell>{monthLabel(t.month)}</TableCell>
              <TableCell>{t.year}</TableCell>
              <TableCell>
                <DropdownMenu icon={<MenuIcon fontSize="small" />}>
                  <Tooltip title="Edit">
                    <MenuItem onClick={() => onEditTest(t.externalId)}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <MenuItem onClick={() => setDeleteTarget(t)}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </Tooltip>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {!loading && tests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary">
                  No tests yet.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteDialog
        open={!!deleteTarget}
        title="Delete test?"
        subtitle={`You are about to delete "${deleteTarget?.name ?? ''}".`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
