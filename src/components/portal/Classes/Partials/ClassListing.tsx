import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EmptyState from '../../../../common/EmptyState';
import type { Class } from '../@types/class';

interface Props {
  rows: Class[];
  loading: boolean;
  searching: boolean;
  failed: boolean;
  // Students and subjects both loaded, so the counts can be trusted
  countsReady: boolean;
  studentCount: (cls: Class) => number;
  subjectCount: (cls: Class) => number;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onAssign: (cls: Class) => void;
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

export default function ClassListing({
  rows,
  loading,
  searching,
  failed,
  countsReady,
  studentCount,
  subjectCount,
  onEdit,
  onDelete,
  onAssign,
}: Props) {
  if (!loading && rows.length === 0) {
    if (failed) return null;
    return (
      <Card>
        <EmptyState
          title={searching ? 'No classes match' : 'No classes yet'}
          detail={
            searching
              ? 'Check the spelling.'
              : 'Add a class, then assign its subjects.'
          }
        />
      </Card>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.75,
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
      }}
    >
      {loading && rows.length === 0
        ? [0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={150} />
          ))
        : rows.map((cls) => {
            const subjects = subjectCount(cls);
            return (
              <Card key={cls.externalId} sx={{ p: 2.25 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    component="h2"
                    noWrap
                    sx={{ fontSize: 24, fontWeight: 800 }}
                  >
                    {cls.name}
                  </Typography>
                  <Box sx={{ flex: 'none' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label={`Edit ${cls.name}`}
                        onClick={() => onEdit(cls)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        aria-label={`Delete ${cls.name}`}
                        onClick={() => onDelete(cls)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.hint', mb: 1.25 }}
                >
                  {countsReady
                    ? plural(studentCount(cls), 'student')
                    : '\u00A0'}
                </Typography>
                {!countsReady ? (
                  <Skeleton variant="rounded" height={26} width={140} />
                ) : subjects > 0 ? (
                  <Chip
                    size="small"
                    label={`${plural(subjects, 'subject')} assigned`}
                    sx={(theme) => ({
                      bgcolor: theme.palette.studio.greenSoft,
                      color: theme.palette.studio.greenInk,
                    })}
                  />
                ) : (
                  <Box
                    sx={(theme) => ({
                      p: 1.25,
                      color: theme.palette.studio.amberInk,
                      bgcolor: theme.palette.studio.amberSoft,
                      borderRadius: `${theme.studio.radii.medium}px`,
                    })}
                  >
                    <Typography variant="body2" color="inherit">
                      No subjects assigned yet.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onAssign(cls)}
                      sx={{ mt: 1 }}
                    >
                      Assign subjects
                    </Button>
                  </Box>
                )}
              </Card>
            );
          })}
    </Box>
  );
}
