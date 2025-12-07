import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';

import {
  Visibility as PreviewIcon,
  Download as DownloadIcon,
  LocalPrintshop as PrintIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import ReportPreviewModal from './ReportPreviewModal';
import { SampleReportCard } from '../../../../config/constants';

interface IGeneratedReportsProps {
  reportSettings: any;
}
const GeneratedReports = ({ reportSettings }: IGeneratedReportsProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [_activePreview, setActivePreview] = useState(null);

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Generated Reports
          </Typography>
          {reportSettings?.studentIds.map((name: any, index: number) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={1}
              borderBottom="1px solid #eee"
            >
              <Typography>{name}</Typography>
              <Box>
                <Tooltip title="Preview">
                  <IconButton
                    color="default"
                    onClick={() => {
                      setActivePreview(name);
                      setPreviewOpen(true);
                    }}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton color="default">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Print">
                  <IconButton color="default">
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {previewOpen && (
        <ReportPreviewModal
          open={true}
          onClose={() => setPreviewOpen(false)}
          data={SampleReportCard}
        />
      )}
    </>
  );
};

export default GeneratedReports;
