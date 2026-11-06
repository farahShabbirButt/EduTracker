import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchDashboard } from '../../../redux/slices/dashboardSlice';
import {
  clearClassConduct,
  fetchClassConduct,
  saveClassConduct,
} from '../../../redux/slices/conductSlice';
import { MonthList } from '../../../config/constants';
import EmptyState from '../../../common/EmptyState';
import { useNavigationGuard } from '../../../layout/NavigationGuard';
import { CONDUCT_RATING_OPTIONS, ConductRating } from './@types/conduct.d';

type Rating = ConductRating | '';
type Ratings = Record<string, { behaviour: Rating; uniform: Rating }>;

export default function ConductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { setDirty, confirmLeaving } = useNavigationGuard();
  const [searchParams] = useSearchParams();
  const classes = useSelector((state: RootState) => state.classes.classes);
  const { rows, loading, saving, error } = useSelector(
    (state: RootState) => state.conduct
  );

  const [now] = useState(() => new Date());
  const [classId, setClassId] = useState(searchParams.get('class') ?? '');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [ratings, setRatings] = useState<Ratings>({});

  const years = [now.getFullYear(), now.getFullYear() - 1];
  const fetching = useRef<{ abort: () => void } | null>(null);

  const load = () => {
    if (!classId) return;
    fetching.current?.abort();
    fetching.current = dispatch(
      fetchClassConduct({ classExternalId: classId, month, year })
    );
  };

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  // A link from Needs attention, while already on this page
  const linkedClass = searchParams.get('class');
  useEffect(() => {
    if (linkedClass) setClassId(linkedClass);
  }, [linkedClass]);

  useEffect(() => {
    dispatch(clearClassConduct());
    load();
    return () => fetching.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, month, year]);

  useEffect(() => {
    setRatings(
      Object.fromEntries(
        (rows ?? []).map((row) => [
          row.externalId,
          {
            behaviour: row.behaviour ?? '',
            uniform: row.uniformCleanliness ?? '',
          },
        ])
      )
    );
  }, [rows]);

  const changed = useMemo(
    () =>
      (rows ?? []).filter((row) => {
        const current = ratings[row.externalId];
        return (
          current &&
          (current.behaviour !== (row.behaviour ?? '') ||
            current.uniform !== (row.uniformCleanliness ?? ''))
        );
      }),
    [rows, ratings]
  );

  const half = changed.some((row) => {
    const current = ratings[row.externalId];
    return !current.behaviour || !current.uniform;
  });

  useEffect(() => {
    setDirty(changed.length > 0);
  }, [changed, setDirty]);

  useEffect(() => () => setDirty(false), [setDirty]);

  const setRating = (
    id: string,
    field: 'behaviour' | 'uniform',
    value: Rating
  ) => setRatings((was) => ({ ...was, [id]: { ...was[id], [field]: value } }));

  const setAllGood = () =>
    setRatings((was) =>
      Object.fromEntries(
        Object.keys(was).map((id) => [
          id,
          {
            behaviour: was[id].behaviour || ConductRating.GOOD,
            uniform: was[id].uniform || ConductRating.GOOD,
          },
        ])
      )
    );

  const handleSave = async () => {
    const result = await dispatch(
      saveClassConduct({
        classExternalId: classId,
        month,
        year,
        entries: changed.map((row) => ({
          studentExternalId: row.externalId,
          behaviour: ratings[row.externalId].behaviour as ConductRating,
          uniformCleanliness: ratings[row.externalId].uniform as ConductRating,
        })),
      })
    );
    if (saveClassConduct.fulfilled.match(result)) {
      toast.success(result.payload);
      load();
      dispatch(fetchDashboard());
    } else {
      toast.error(result.payload as string);
    }
  };

  const select = (apply: () => void) => confirmLeaving(apply);

  const ratingSelect = (
    id: string,
    name: string,
    field: 'behaviour' | 'uniform',
    label: string
  ) => {
    const value = ratings[id]?.[field] ?? '';
    return (
      <TextField
        select
        size="small"
        fullWidth
        value={value}
        disabled={saving}
        aria-label={`${label} for ${name}`}
        slotProps={{
          select: {
            displayEmpty: true,
            inputProps: { 'aria-label': `${label} for ${name}` },
          },
        }}
        sx={(theme) => ({
          minWidth: 170,
          '& .MuiOutlinedInput-notchedOutline': value
            ? undefined
            : { borderColor: theme.palette.studio.amber },
        })}
        onChange={(e) => setRating(id, field, e.target.value as Rating)}
      >
        <MenuItem value="" disabled>
          Not rated
        </MenuItem>
        {CONDUCT_RATING_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'flex-end' }}
      >
        <TextField
          select
          label="Class"
          value={classId}
          disabled={saving}
          onChange={(e) => {
            const next = e.target.value;
            select(() => setClassId(next));
          }}
          sx={{ minWidth: 180 }}
        >
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Month"
          value={month}
          disabled={saving}
          onChange={(e) => {
            const next = Number(e.target.value);
            select(() => setMonth(next));
          }}
          sx={{ minWidth: 150 }}
        >
          {MonthList.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          value={year}
          disabled={saving}
          onChange={(e) => {
            const next = Number(e.target.value);
            select(() => setYear(next));
          }}
          sx={{ minWidth: 110 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          onClick={setAllGood}
          disabled={!rows?.length || saving}
        >
          Set the rest to Good
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={changed.length === 0 || half || saving}
        >
          {saving ? 'Saving' : 'Save conduct'}
        </Button>
      </Stack>

      {half && (
        <Alert severity="warning">
          Each student needs both ratings before you can save.
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Card sx={{ p: 1.5 }}>
        {rows && rows.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Behaviour</TableCell>
                  <TableCell>Uniform and cleanliness</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const name = [row.firstName, row.lastName]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <TableRow key={row.externalId}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                          }}
                        >
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
                            {name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {name}
                            </Typography>
                            <Typography variant="caption">
                              Roll {row.rollNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {ratingSelect(
                          row.externalId,
                          name,
                          'behaviour',
                          'Behaviour'
                        )}
                      </TableCell>
                      <TableCell>
                        {ratingSelect(
                          row.externalId,
                          name,
                          'uniform',
                          'Uniform'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !loading && (
            <EmptyState
              title={
                !classId
                  ? 'Choose a class'
                  : error
                    ? 'Conduct could not load'
                    : 'No students in this class'
              }
              detail={
                !classId ? 'Everyone in the class appears here.' : undefined
              }
            />
          )
        )}
      </Card>
    </Stack>
  );
}
