import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';

import { Visibility as PreviewIcon } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../redux/store';
import ReportPreviewModal from './ReportPreviewModal';

interface IGeneratedReportsProps {
  reportSettings: IReportSettings;
}
const GeneratedReports = ({ reportSettings }: IGeneratedReportsProps) => {
  const { students } = useSelector((state: RootState) => state.students);
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

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Generated Reports
          </Typography>
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
