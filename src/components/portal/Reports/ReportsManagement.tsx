import { useEffect, useRef, useState } from 'react';
import { Stack, type SelectChangeEvent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { TestType } from '../../../@types/global.d';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchClasses } from '../../../redux/slices/classSlice';
import { fetchStudents } from '../../../redux/slices/studentSlice';
import { fetchInstitute } from '../../../redux/slices/instituteSlice';
import ReportSettings from './Partials/ReportSettings';
import GeneratedReports from './Partials/GeneratedReports';

const PERIOD_FIELDS = ['fromMonth', 'fromYear', 'toMonth', 'toYear'];

// The school year running today
const schoolYearPeriod = (startMonth: number) => {
  const today = new Date();
  const year = today.getFullYear();
  const fromYear = today.getMonth() + 1 >= startMonth ? year : year - 1;

  return {
    fromMonth: startMonth,
    fromYear,
    toMonth: startMonth === 1 ? 12 : startMonth - 1,
    toYear: startMonth === 1 ? fromYear : fromYear + 1,
  };
};

const ReportsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const startDate = useSelector(
    (state: RootState) => state.institute.institute?.schoolYearStartDate
  );
  const startMonth = startDate ? Number(startDate.slice(5, 7)) : undefined;
  const [reportSettings, setReportSettings] = useState<IReportSettings>({
    reportMode: TestType.MONTHLY,
    classId: '',
    ...schoolYearPeriod(startMonth ?? 1),
    studentIds: [],
  });

  const [generated, setGenerated] = useState(false);
  const periodPicked = useRef(false);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
    dispatch(fetchInstitute());
  }, [dispatch]);

  // A slow load mustn't replace a period already picked
  useEffect(() => {
    if (startMonth && !periodPicked.current) {
      setReportSettings((prev) => ({
        ...prev,
        ...schoolYearPeriod(startMonth),
      }));
    }
  }, [startMonth]);

  // Generated cards belong to the period they were asked for
  useEffect(() => {
    setGenerated(false);
  }, [
    reportSettings.fromMonth,
    reportSettings.fromYear,
    reportSettings.toMonth,
    reportSettings.toYear,
  ]);

  // A student list picked under one class doesn't carry over to another, and
  // an already-generated set of reports is stale the moment the selection
  // changes underneath it.
  useEffect(() => {
    setReportSettings((prev) => ({ ...prev, studentIds: [] }));
    setGenerated(false);
  }, [reportSettings.classId]);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    if (PERIOD_FIELDS.includes(name)) periodPicked.current = true;

    setReportSettings((prev) => ({
      ...prev,
      [name]:
        name === 'studentIds'
          ? Array.isArray(value)
            ? value
            : value.split(',')
          : PERIOD_FIELDS.includes(name)
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
