import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { toast } from 'react-toastify';
import FormPanel from '../FormPanel';
import { useNavigationGuard } from '../../layout/NavigationGuard';
import {
  downloadTemplate,
  matchColumns,
  openSheetFile,
  SheetReadError,
  type ImportColumn,
  type OpenedFile,
} from './readSheet';
import type { ImportCheck, ImportResult, ImportStatus } from './importTypes';

interface Props<F extends string> {
  open: boolean;
  onClose: () => void;
  // e.g. "Import classes"
  title: string;
  // e.g. ['class', 'classes']
  noun: [string, string];
  columns: ImportColumn<F>[];
  templateName: string;
  // Heading of the preview's second column; the server's label for each row
  labelHeading?: string;
  // A line above the file picker saying what the file needs
  intro?: ReactNode;
  // Extra choices, e.g. one class for every row
  options?: ReactNode;
  // When this changes the preview is checked again
  optionsKey?: string;
  // False while the options aren't complete
  ready?: boolean;
  check: ImportCheck<F>;
  onImported: (message: string, result: ImportResult) => void;
}

const STATUS_LABEL: Record<ImportStatus, string> = {
  new: 'New',
  exists: 'Already there',
  problem: 'Problem',
};

function StatusChip({
  status,
  count,
}: {
  status: ImportStatus;
  count?: number;
}) {
  return (
    <Chip
      size="small"
      label={
        count === undefined
          ? STATUS_LABEL[status]
          : `${STATUS_LABEL[status]} ${count}`
      }
      sx={(theme) => {
        const c = theme.palette.studio;
        const [bg, ink] =
          status === 'new'
            ? [c.greenSoft, c.greenInk]
            : status === 'exists'
              ? [c.surfaceSoft, c.inkSoft]
              : [c.redSoft, c.redStrong];
        return { bgcolor: bg, color: ink, fontWeight: 700 };
      }}
    />
  );
}

// The three steps of every import: choose the file, check the preview the server
// makes, then import. Nothing is saved until Import, and Import is all or nothing.
export default function ImportPanel<F extends string>({
  open,
  onClose,
  title,
  noun,
  columns,
  templateName,
  labelHeading,
  intro,
  options,
  optionsKey = '',
  ready = true,
  check,
  onImported,
}: Props<F>) {
  const { setDirty } = useNavigationGuard();
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [opened, setOpened] = useState<OpenedFile | null>(null);
  const [sheet, setSheet] = useState('');
  const [readError, setReadError] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [problemsOnly, setProblemsOnly] = useState(false);
  const [importing, setImporting] = useState(false);
  // Only the latest preview may land
  const latest = useRef(0);

  const matched = useMemo(
    () => (opened && sheet ? matchColumns(opened.grid(sheet), columns) : null),
    [opened, sheet, columns]
  );

  const reset = useCallback(() => {
    // Cleared now, not after the next render, so closing isn't held as leaving
    setDirty(false);
    latest.current++;
    setFileName('');
    setOpened(null);
    setSheet('');
    setReadError('');
    setCheckError('');
    setResult(null);
    setProblemsOnly(false);
    setChecking(false);
    if (input.current) input.current.value = '';
  }, [setDirty]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // A checked file is work to lose
  useEffect(() => {
    setDirty(open && opened !== null, reset);
    return () => setDirty(false);
  }, [open, opened, setDirty, reset]);

  const rows = matched?.rows;
  useEffect(() => {
    setResult(null);
    setCheckError('');
    if (!rows || rows.length === 0 || !ready) return;
    const id = ++latest.current;
    setChecking(true);
    check(rows, true).then((answer) => {
      if (id !== latest.current) return;
      setChecking(false);
      if (answer.ok) setResult(answer.result);
      else setCheckError(answer.message);
    });
    // check changes identity with the options; optionsKey says when that matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, ready, optionsKey]);

  const choose = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    try {
      const next = await openSheetFile(file);
      setOpened(next);
      setSheet(next.sheetNames[0] ?? '');
    } catch (error) {
      setReadError(
        error instanceof SheetReadError
          ? error.message
          : "This file couldn't be read. Check it opens in Excel and try again"
      );
    }
  };

  const close = () => {
    reset();
    onClose();
  };

  const runImport = async () => {
    if (!rows) return;
    setImporting(true);
    const answer = await check(rows, false);
    setImporting(false);
    if (!answer.ok) {
      // Something changed since the preview: show it again with the new answer
      toast.error(answer.message);
      const id = ++latest.current;
      setChecking(true);
      const again = await check(rows, true);
      if (id !== latest.current) return;
      setChecking(false);
      if (again.ok) setResult(again.result);
      else {
        setResult(null);
        setCheckError(again.message);
      }
      return;
    }
    reset();
    onImported(answer.message, answer.result);
  };

  const counts = result?.counts;
  const shown =
    result?.rows.filter((r) => !problemsOnly || r.status === 'problem') ?? [];
  const canImport =
    !!counts &&
    counts.problem === 0 &&
    counts.new > 0 &&
    !checking &&
    !importing &&
    ready;
  const required = columns.filter((c) => c.required).map((c) => c.label);
  const optional = columns.filter((c) => !c.required).map((c) => c.label);

  return (
    <FormPanel open={open} label={title}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {intro && <Typography color="text.secondary">{intro}</Typography>}
          <Typography variant="body2" color="text.secondary">
            Needs the column{required.length > 1 ? 's' : ''}{' '}
            {required.join(', ')}.
            {optional.length > 0 && ` Can also have ${optional.join(', ')}.`}{' '}
            The first row with these headings is used, and any other columns are
            ignored.{' '}
            <Link
              component="button"
              type="button"
              onClick={() =>
                downloadTemplate(columns, templateName).catch(() =>
                  toast.error("The template couldn't be made. Try again")
                )
              }
              sx={{ verticalAlign: 'baseline' }}
            >
              Download template
            </Link>
          </Typography>

          {options}

          <Box>
            <input
              ref={input}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              hidden
              aria-label="Excel or CSV file"
              onChange={(e) => choose(e.target.files?.[0])}
            />
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => input.current?.click()}
              disabled={importing}
            >
              {fileName ? 'Choose another file' : 'Choose Excel or CSV file'}
            </Button>
            {fileName && (
              <Typography
                variant="body2"
                sx={{ mt: 1, wordBreak: 'break-all' }}
              >
                {fileName}
              </Typography>
            )}
          </Box>

          {readError && <Alert severity="error">{readError}</Alert>}

          {opened && opened.sheetNames.length > 1 && (
            <TextField
              select
              size="small"
              label="Sheet"
              disabled={importing}
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
            >
              {opened.sheetNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {matched && matched.missing.length > 0 && (
            <Alert severity="error">
              This sheet has no heading row with {matched.missing.join(', ')}.
              Add{' '}
              {matched.missing.length > 1 ? 'those headings' : 'that heading'}{' '}
              above the data, or use the template.
            </Alert>
          )}

          {matched &&
            matched.missing.length === 0 &&
            matched.rows.length === 0 && (
              <Alert severity="warning">
                This sheet has headings but no rows under them.
              </Alert>
            )}

          {matched && matched.ignored.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Ignored columns: {matched.ignored.join(', ')}
            </Typography>
          )}

          {checkError && <Alert severity="error">{checkError}</Alert>}

          {checking && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Checking the file…</Typography>
            </Stack>
          )}

          {result && counts && (
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <StatusChip status="new" count={counts.new} />
                <StatusChip status="exists" count={counts.exists} />
                <StatusChip status="problem" count={counts.problem} />
              </Stack>
              {counts.problem > 0 ? (
                <Alert severity="error">
                  Fix the rows with problems in the file and choose it again.
                  Nothing is imported while any row has a problem.
                </Alert>
              ) : counts.new === 0 ? (
                <Alert severity="info">
                  Every {noun[0]} in this file is already there.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nothing is saved until you press Import.
                </Typography>
              )}
              {counts.problem > 0 && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={problemsOnly}
                      onChange={(e) => setProblemsOnly(e.target.checked)}
                    />
                  }
                  label="Show problems only"
                />
              )}
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" aria-label="Rows in the file">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>{labelHeading ?? columns[0]?.label}</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shown.map((r) => (
                      <TableRow key={r.row}>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          {r.row}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          {r.label || '—'}
                          {r.messages.map((m, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              color={
                                r.status === 'problem'
                                  ? 'error'
                                  : 'text.secondary'
                              }
                            >
                              {m}
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <StatusChip status={r.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={importing}>
          Cancel
        </Button>
        <Button variant="contained" onClick={runImport} disabled={!canImport}>
          {counts && counts.new > 0
            ? `Import ${counts.new} ${counts.new === 1 ? noun[0] : noun[1]}`
            : 'Import'}
        </Button>
      </DialogActions>
    </FormPanel>
  );
}
