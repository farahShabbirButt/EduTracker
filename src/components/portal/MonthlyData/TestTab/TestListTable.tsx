import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchTests, removeTest } from '../../../../redux/slices/testSlice';
import { MonthList } from '../../../../config/constants';
import EmptyState from '../../../../common/EmptyState';
import { percentOf } from '../../../../common/percent';
import ProgressBar from '../../../../common/ProgressBar';
import DeleteDialog from '../../../../common/Dialogs/DeleteDialog/DeleteDialog';
import LoadError from '../../../../common/LoadError';
import type { ApiTest } from '../@types/testData.d';

// Folded into the test's own cell on phones
const onlyWide = { display: { xs: 'none', sm: 'table-cell' } };

export default function TestListTable({
  onEditTest,
}: {
  onEditTest: (externalId: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { tests, loading, loadError } = useSelector(
    (state: RootState) => state.tests
  );
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test</TableCell>
              <TableCell sx={onlyWide}>Class</TableCell>
              <TableCell sx={onlyWide}>Month</TableCell>
              <TableCell sx={{ minWidth: { xs: 90, sm: 190 } }}>
                Marks entered
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tests.map((t) => {
              const percent = percentOf(t.marksEntered, t.marksExpected);
              return (
                <TableRow key={t.externalId}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {t.name}
                    <Typography
                      variant="caption"
                      sx={{ display: { xs: 'block', sm: 'none' } }}
                    >
                      {t.class?.name}, {monthLabel(t.month)} {t.year}
                    </Typography>
                  </TableCell>
                  <TableCell sx={onlyWide}>{t.class?.name}</TableCell>
                  <TableCell sx={{ ...onlyWide, whiteSpace: 'nowrap' }}>
                    {monthLabel(t.month)} {t.year}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <ProgressBar
                          value={percent}
                          label={`Marks entered for ${t.name}`}
                        />
                      </Box>
                      <Typography variant="body2">{percent}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label={`Edit ${t.name}`}
                        onClick={() => onEditTest(t.externalId)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        aria-label={`Delete ${t.name}`}
                        onClick={() => setDeleteTarget(t)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {loadError && (
              <TableRow>
                <TableCell colSpan={5}>
                  <LoadError
                    message={loadError}
                    onRetry={() => dispatch(fetchTests())}
                  />
                </TableCell>
              </TableRow>
            )}

            {!loading && !loadError && tests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    title="No tests yet"
                    detail="Add this month's test to start entering marks."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteDialog
        open={!!deleteTarget}
        title="Delete test?"
        subtitle={`You are about to delete "${deleteTarget?.name ?? ''}". A test with marks can't be deleted until they are cleared.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
