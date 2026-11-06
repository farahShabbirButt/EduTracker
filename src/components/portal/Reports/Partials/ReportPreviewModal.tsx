import { useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useReactToPrint } from 'react-to-print';
import { ResultCard } from '../ResultCard';
import type { IReportCard } from '../@types/reportCard.d';

const ReportPreviewModal = ({
  card,
  onClose,
}: {
  card: IReportCard;
  onClose: () => void;
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);
  const { missingMarks } = card;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    // Becomes the PDF's file name, so saved cards don't overwrite each other
    documentTitle: `Result Card ${card.student.rollNumber} ${card.student.name}`,
  });

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-label="Result card preview"
    >
      <DialogContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" component="h2" noWrap>
            {card.student.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<PrintOutlinedIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <IconButton aria-label="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        {missingMarks.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
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

        {card.position?.provisional && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Position may change: some students in this class still have marks to
            enter.
          </Alert>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <ResultCard ref={printRef} data={card} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewModal;
