import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
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
import { testWhen } from '../../../../common/testWhen';
import EmptyState from '../../../../common/EmptyState';
import { percentOf } from '../../../../common/percent';
import ProgressBar from '../../../../common/ProgressBar';
import DeleteDialog from '../../../../common/Dialogs/DeleteDialog/DeleteDialog';
import LoadError from '../../../../common/LoadError';
import type { ApiTest } from '../@types/testData.d';
import type { TestType } from '../../../../@types/global';

// null shows every class or type
export type TestFilter = { classId: string | null; testType: TestType | null };

// Folded into the test's own cell on phones
const onlyWide = { display: { xs: 'none', sm: 'table-cell' } };

const typeLabel = (t: ApiTest) =>
  t.testType === 'SESSION' ? 'Test session' : 'Monthly';

export default function TestListTable({
  filter,
  onEditTest,
  onClearFilter,
}: {
  filter: TestFilter;
  onEditTest: (externalId: string) => void;
  onClearFilter: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { tests, loading, loadError } = useSelector(
    (state: RootState) => state.tests
  );
  const [deleteTarget, setDeleteTarget] = useState<ApiTest | null>(null);

  const { classId, testType } = filter;
  const shown = useMemo(
    () =>
      tests.filter(
        (t) =>
          (!classId || t.class?.externalId === classId) &&
          (!testType || t.testType === testType)
      ),
    [tests, classId, testType]
  );

  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);

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
              <TableCell sx={onlyWide}>Type</TableCell>
              <TableCell sx={onlyWide}>Class</TableCell>
              <TableCell sx={onlyWide}>When</TableCell>
              <TableCell sx={{ minWidth: { xs: 90, sm: 190 } }}>
                Marks entered
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {shown.map((t) => {
              const percent = percentOf(t.marksEntered, t.marksExpected);
              return (
                <TableRow key={t.externalId}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {t.name}
                    <Typography
                      variant="caption"
                      sx={{ display: { xs: 'block', sm: 'none' } }}
                    >
                      {typeLabel(t)}, {t.class?.name}, {testWhen(t)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={onlyWide}>
                    <Chip
                      label={typeLabel(t)}
                      size="small"
                      color={t.testType === 'SESSION' ? 'primary' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={onlyWide}>{t.class?.name}</TableCell>
                  <TableCell sx={{ ...onlyWide, whiteSpace: 'nowrap' }}>
                    {testWhen(t)}
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
                <TableCell colSpan={6}>
                  <LoadError
                    message={loadError}
                    onRetry={() => dispatch(fetchTests())}
                  />
                </TableCell>
              </TableRow>
            )}

            {!loading && !loadError && tests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No tests yet"
                    detail="Add this month's test to start entering marks."
                  />
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !loadError &&
              tests.length > 0 &&
              shown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      title="No tests match these filters"
                      detail="Pick another class or type, or show every test."
                      action={
                        <Button variant="outlined" onClick={onClearFilter}>
                          Show all tests
                        </Button>
                      }
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
