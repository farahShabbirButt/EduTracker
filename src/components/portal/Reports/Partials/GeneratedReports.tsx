import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';

import {
  Print as PrintIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchReportsForPrint } from '../../../../redux/slices/reportSlice';
import { ResultCard } from '../../../testers/ResultCard';
import type { IReportCard } from '../@types/reportCard.d';
import ReportPreviewModal from './ReportPreviewModal';

interface IGeneratedReportsProps {
  reportSettings: IReportSettings;
}
const GeneratedReports = ({ reportSettings }: IGeneratedReportsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { students } = useSelector((state: RootState) => state.students);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cards, setCards] = useState<IReportCard[]>([]);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  const printCards = useReactToPrint({
    contentRef: cardsRef,
    documentTitle: 'Result Cards',
    onAfterPrint: () => setCards([]),
  });

  useEffect(() => {
    if (cards.length > 0) printCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeStudentExternalId, setActiveStudentExternalId] = useState<
    string | null
  >(null);

  const { fromMonth, fromYear, toMonth, toYear } = reportSettings;
  const period = useMemo(
    () => ({
      from: { month: fromMonth, year: fromYear },
      to: { month: toMonth, year: toYear },
    }),
    [fromMonth, fromYear, toMonth, toYear]
  );

  // Resolve the selected externalIds back to the real student records —
  // studentIds only ever carries externalIds, never display names.
  const selectedStudents = students.filter((s) =>
    reportSettings.studentIds.includes(s.externalId)
  );

  const handlePrintAll = async () => {
    setLoadingCards(true);
    const result = await dispatch(
      fetchReportsForPrint({
        studentExternalIds: selectedStudents.map((s) => s.externalId),
        period,
      })
    );
    setLoadingCards(false);

    if (!fetchReportsForPrint.fulfilled.match(result)) {
      toast.error(result.payload as string);
      return;
    }

    const printable = result.payload.filter((card) => card.rows.length > 0);
    const skipped = result.payload.length - printable.length;
    const incomplete = printable.filter(
      (card) => card.missingMarks.length > 0
    ).length;

    if (skipped > 0) {
      toast.warning(`${skipped} student(s) have no tests in this period`);
    }
    if (incomplete > 0) {
      toast.warning(`${incomplete} card(s) have marks not entered`);
    }
    if (printable.some((card) => card.position?.provisional)) {
      toast.warning(
        'Positions may change: some students still have marks to enter'
      );
    }
    setCards(printable);
  };

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Generated Reports</Typography>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintAll}
              disabled={loadingCards || selectedStudents.length === 0}
            >
              {loadingCards ? 'Loading cards…' : 'Print All'}
            </Button>
          </Box>
          {selectedStudents.map((student) => (
            <Box
              key={student.externalId}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={1}
              borderBottom="1px solid #eee"
            >
              <Typography>
                {student.firstName} {student.lastName} ({student.rollNumber})
              </Typography>
              <Box>
                <Tooltip title="Preview">
                  <IconButton
                    color="default"
                    onClick={() => {
                      setActiveStudentExternalId(student.externalId);
                      setPreviewOpen(true);
                    }}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Only ever printed, never shown */}
      <Box sx={{ display: 'none' }}>
        <div ref={cardsRef}>
          {cards.map((card) => (
            <div className="page" key={card.student.rollNumber}>
              <ResultCard data={card} />
            </div>
          ))}
        </div>
      </Box>

      {activeStudentExternalId && (
        <ReportPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          studentExternalId={activeStudentExternalId}
          period={period}
        />
      )}
    </>
  );
};

export default GeneratedReports;
