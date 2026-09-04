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

interface IReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  studentExternalId: string;
  year: number;
}

const ReportPreviewModal = ({
  open,
  onClose,
  studentExternalId,
  year,
}: IReportPreviewModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { report, loading, error } = useSelector(
    (state: RootState) => state.report
  );
  const printRef = useRef<HTMLDivElement | null>(null);

  // Same working react-to-print pattern used by ResultCardPreview.
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Result Card',
  });

  // Loads the real card whenever the modal opens for a given student/year.
  // Aborts a still-in-flight request if closed before it resolves.
  useEffect(() => {
    if (!open) return;

    const request = dispatch(fetchReport({ studentExternalId, year }));

    return () => {
      request.abort();
    };
  }, [dispatch, open, studentExternalId, year]);

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
            disabled={!report}
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

        {!loading && !error && report && (
          <div className="page">
            <ResultCard ref={printRef} data={report} />
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default ReportPreviewModal;
