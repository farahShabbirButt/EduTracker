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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
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
import FilterBar from '../../../common/FilterBar';
import LabeledSelect from '../../../common/Form/LabeledSelect';
import { useNavigationGuard } from '../../../layout/NavigationGuard';
import { CONDUCT_RATING_OPTIONS, ConductRating } from './@types/conduct.d';

type Rating = ConductRating | '';
type Ratings = Record<string, { behaviour: Rating; uniform: Rating }>;

// Each student's cells stack on a phone
const stackedRow = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'block',
    borderBottom: 1,
    borderColor: 'divider',
    '& td': { display: 'block', borderBottom: 0 },
  },
});

export default function ConductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Opens on a class, so there's something to rate straight away
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].externalId);
  }, [classId, classes]);

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
        // The column headings are hidden on a phone
        label={phone ? label : undefined}
        value={value}
        disabled={saving}
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            notched: phone || undefined,
            inputProps: { 'aria-label': `${label} for ${name}` },
          },
        }}
        sx={(theme) => ({
          minWidth: { sm: 170 },
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
      <FilterBar>
        <LabeledSelect
          label="Class"
          placeholder="Choose a class"
          value={classId}
          disabled={saving}
          options={Object.fromEntries(
            classes.map((c) => [c.externalId, c.name])
          )}
          onChange={(value) => select(() => setClassId(value))}
        >
          {classes.map((c) => (
            <MenuItem key={c.externalId} value={c.externalId}>
              {c.name}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Month"
          value={month}
          disabled={saving}
          minWidth={150}
          options={Object.fromEntries(MonthList.map((m) => [m.value, m.label]))}
          onChange={(value) => select(() => setMonth(Number(value)))}
        >
          {MonthList.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Year"
          value={year}
          disabled={saving}
          minWidth={110}
          onChange={(value) => select(() => setYear(Number(value)))}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </LabeledSelect>
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
      </FilterBar>

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
              <TableHead
                sx={{ display: { xs: 'none', sm: 'table-header-group' } }}
              >
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
                    <TableRow key={row.externalId} sx={stackedRow}>
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
              icon={<StarBorderOutlinedIcon />}
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
