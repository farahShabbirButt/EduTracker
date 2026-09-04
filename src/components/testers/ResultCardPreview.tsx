import { useRef } from 'react';
import { Box, Button, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useReactToPrint } from 'react-to-print';
import { ResultCard } from './ResultCard';
import { ResultSampleData } from '../../config/constants';

const ResultCardPreview = () => {
  const printRef = useRef<HTMLDivElement | null>(null);

  // ✅ New API style
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Result Card',
    // removeAfterPrint: true,
  });
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} className="no-print" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Result Card
        </Button>
      </Stack>

      <div className="page">
        <ResultCard ref={printRef} data={ResultSampleData} />
      </div>
    </Box>
  );
};

export default ResultCardPreview;
