import { useEffect, useRef } from 'react';
import {
  Box,
  Modal,
  CircularProgress,
  Alert,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchReport, clearReport } from '../../../../redux/slices/reportSlice';
import { ResultCard } from '../../../testers/ResultCard';
import type { IReportPeriod } from '../@types/reportCard.d';

interface IReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  studentExternalId: string;
  period: IReportPeriod;
}

const ReportPreviewModal = ({
  open,
  onClose,
  studentExternalId,
  period,
}: IReportPreviewModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { report, loading, error } = useSelector(
    (state: RootState) => state.report
  );
  const printRef = useRef<HTMLDivElement | null>(null);
  const hasTests = !!report && report.rows.length > 0;
  const missingMarks = report?.missingMarks ?? [];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    // Becomes the PDF's file name, so saved cards don't overwrite each other
    documentTitle: report
      ? `Result Card ${report.student.rollNumber} ${report.student.name}`
      : 'Result Card',
  });

  // Loads the real card whenever the modal opens for a student and period.
  // Aborts a still-in-flight request if closed before it resolves.
  useEffect(() => {
    if (!open) return;

    const request = dispatch(fetchReport({ studentExternalId, period }));

    return () => {
      request.abort();
    };
  }, [dispatch, open, studentExternalId, period]);

  // Clears the loaded card once the modal closes, so a stale card can't
  // flash before the next fetch resolves.
  useEffect(() => {
    if (!open) {
      dispatch(clearReport());
    }
  }, [dispatch, open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '90%',
          maxWidth: 1200,
          mx: 'auto',
          mt: 5,
          mb: 5,
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          className="no-print"
          sx={{ mb: 2 }}
        >
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!hasTests}
          >
            Print Result Card
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && report && !hasTests && (
          <Alert severity="info">
            No tests found for this period, so there is no result card to print.
          </Alert>
        )}

        {!loading && !error && hasTests && missingMarks.length > 0 && (
          <Alert severity="warning" className="no-print" sx={{ mb: 2 }}>
            This card is incomplete: {missingMarks.length} mark
            {missingMarks.length === 1 ? ' is' : 's are'} not entered, so{' '}
            {missingMarks.length === 1 ? 'it prints' : 'they print'} blank and
            {missingMarks.length === 1 ? " isn't" : " aren't"} counted.{' '}
            {missingMarks
              .slice(0, 5)
              .map((m) => `${m.testName}: ${m.subjectName}`)
              .join(', ')}
            {missingMarks.length > 5 && ` and ${missingMarks.length - 5} more`}
          </Alert>
        )}

        {!loading && !error && report?.position?.provisional && (
          <Alert severity="warning" className="no-print" sx={{ mb: 2 }}>
            Position may change: some students in this class still have marks to
            enter.
          </Alert>
        )}

        {!loading && !error && hasTests && (
          <div className="page">
            <ResultCard ref={printRef} data={report} />
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default ReportPreviewModal;
