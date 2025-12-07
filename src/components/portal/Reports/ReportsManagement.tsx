import { useState } from 'react';
import { Stack, type SelectChangeEvent } from '@mui/material';
import { TestType } from '../../../@types/global.d';
import ReportSettings from './Partials/ReportSettings';
import GeneratedReports from './Partials/GeneratedReports';

const ReportsManagement = () => {
  const [reportSettings, setReportSettings] = useState<IReportSettings>({
    reportMode: TestType.MONTHLY,
    classId: '',
    testId: '',
    studentIds: [],
  });

  const [generated, setGenerated] = useState(false);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;

    setReportSettings((prev) => ({
      ...prev,
      [name]:
        name === 'studentIds'
          ? Array.isArray(value)
            ? value
            : value.split(',')
          : value,
    }));
  };
  const handleGenerate = () => {
    setGenerated(true);
  };

  return (
    <Stack spacing={2}>
      <ReportSettings
        reportSettings={reportSettings}
        handleChangeSettings={handleChange}
        handleGenerateReport={handleGenerate}
      />

      {generated && <GeneratedReports reportSettings={reportSettings} />}
    </Stack>
  );
};

export default ReportsManagement;
