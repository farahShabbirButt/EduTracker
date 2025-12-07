import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Modal,
} from '@mui/material';
import type { SampleReportCard } from '../../../../config/constants';

interface IReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: typeof SampleReportCard;
}
const ReportPreviewModal = ({
  open,
  onClose,
  data,
}: IReportPreviewModalProps) => {
  const subjectList = Object.keys(data.tests[0].subjects);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: '80%',
          mx: 'auto',
          mt: 5,
          bgcolor: '#fff',
          p: 3,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Typography variant="h5" align="center" fontWeight={700}>
          MONTHLY ASSESSMENT REPORT
        </Typography>
        <Typography align="center" fontSize={14}>
          FARRUKH ACADEMY OF SCIENCE
        </Typography>
        <Typography align="center" fontSize={12}>
          Dhobi Ghat Stop Near Nafeerabad Graveyard Shalimar Town Lahore
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Student Info */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography>
              <b>STUDENT NAME:</b> {data.studentInfo.name}
            </Typography>
            <Typography>
              <b>FATHER NAME:</b> {data.studentInfo.fatherName}
            </Typography>
          </Box>
          <Box>
            <Typography>
              <b>CLASS:</b> {data.studentInfo.class}
            </Typography>
            <Typography>
              <b>ROLL NO:</b> {data.studentInfo.rollNo}
            </Typography>
          </Box>
        </Box>

        {/* Test Table */}
        <Table size="small" sx={{ border: '1px solid #000' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
              {subjectList.map((sub) => (
                <TableCell key={sub} sx={{ fontWeight: 700 }}>
                  {sub}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>%</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.tests.map((t: any, idx) => (
              <TableRow key={idx}>
                <TableCell>{t.testName}</TableCell>
                {subjectList.map((sub) => (
                  <TableCell key={sub}>{t.subjects[sub]}</TableCell>
                ))}
                <TableCell>{t.total}</TableCell>
                <TableCell>{t.percentage}%</TableCell>
                <TableCell>{t.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        {/* Behaviour Section */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>
            <b>Behaviour:</b> {data.behaviour}
          </Typography>
          <Typography>
            <b>Uniform:</b> {data.uniformCleanliness}
          </Typography>
        </Box>

        {/* Overall Result */}
        <Box mb={2}>
          <Typography>
            <b>Obtained Marks:</b> {data.overallResult.obtainedMarks}
          </Typography>
          <Typography>
            <b>Total Marks:</b> {data.overallResult.totalMarks}
          </Typography>
          <Typography>
            <b>Percentage:</b> {data.overallResult.percentage}%
          </Typography>
          <Typography>
            <b>Grade:</b> {data.overallResult.grade}
          </Typography>
          <Typography>
            <b>Status:</b> {data.overallResult.status}
          </Typography>
        </Box>

        <Box>
          <Typography>
            <b>Remarks:</b>
          </Typography>
          <Typography>{data.overallResult.remarks}</Typography>
        </Box>
      </Box>
    </Modal>
  );
};
export default ReportPreviewModal;
