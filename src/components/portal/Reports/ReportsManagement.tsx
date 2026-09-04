import { useEffect, useState } from 'react';
import { Stack, type SelectChangeEvent } from '@mui/material';
import { useDispatch } from 'react-redux';
import { TestType } from '../../../@types/global.d';
import type { AppDispatch } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import ReportSettings from './Partials/ReportSettings';
import GeneratedReports from './Partials/GeneratedReports';

const ReportsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [reportSettings, setReportSettings] = useState<IReportSettings>({
    reportMode: TestType.MONTHLY,
    classId: '',
    year: new Date().getFullYear(),
    studentIds: [],
  });

  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
  }, [dispatch]);

  // A student list picked under one class doesn't carry over to another, and
  // an already-generated set of reports is stale the moment the selection
  // changes underneath it.
  useEffect(() => {
    setReportSettings((prev) => ({ ...prev, studentIds: [] }));
    setGenerated(false);
  }, [reportSettings.classId]);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;

    setReportSettings((prev) => ({
      ...prev,
      [name]:
        name === 'studentIds'
          ? Array.isArray(value)
            ? value
            : value.split(',')
          : name === 'year'
            ? Number(value)
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
