import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { TestType } from '../../../../@types/global.d';
import type { RootState } from '../../../../redux/store';
import { MonthList } from '../../../../config/constants';

interface IReportSettingsProps {
  reportSettings: IReportSettings;
  handleGenerateReport: () => void;
  handleChangeSettings: (e: SelectChangeEvent<string | string[]>) => void;
}

// Next year is here because a school year can end in it
const nextYear = new Date().getFullYear() + 1;
const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => nextYear - i);

const ReportSettings = ({
  reportSettings,
  handleGenerateReport,
  handleChangeSettings,
}: IReportSettingsProps) => {
  const { classes } = useSelector((state: RootState) => state.classes);
  const { students } = useSelector((state: RootState) => state.students);

  // Students enrolled in the selected class only, matched by externalId —
  // never by name (a dummy-vs-real name mismatch has silently broken screens
  // on this project before).
  const classStudents = students.filter(
    (s) => s.class?.externalId === reportSettings.classId
  );

  const periodValid =
    reportSettings.fromYear * 12 + reportSettings.fromMonth <=
    reportSettings.toYear * 12 + reportSettings.toMonth;

  return (
    <Card>
      <CardHeader
        title="Report Settings"
        subheader="Choose Settings for you reports once and generate reports as many as you want"
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {/* Report Mode — SESSION is out of scope for now; the backend
              rejects it with a 400, so it's disabled rather than selectable. */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Report Mode</InputLabel>
              <Select
                name="reportMode"
                value={reportSettings?.reportMode}
                label="Report Mode"
                onChange={handleChangeSettings}
              >
                <MenuItem value={TestType.MONTHLY}>Monthly</MenuItem>
                <MenuItem value={TestType.SESSION} disabled>
                  Test Session (Coming Soon)
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Period, filled in from the school year */}
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>From Month</InputLabel>
              <Select
                name="fromMonth"
                value={String(reportSettings.fromMonth)}
                label="From Month"
                onChange={handleChangeSettings}
              >
                {MonthList.map((m) => (
                  <MenuItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>From Year</InputLabel>
              <Select
                name="fromYear"
                value={String(reportSettings.fromYear)}
                label="From Year"
                onChange={handleChangeSettings}
              >
                {YEAR_OPTIONS.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>To Month</InputLabel>
              <Select
                name="toMonth"
                value={String(reportSettings.toMonth)}
                label="To Month"
                onChange={handleChangeSettings}
              >
                {MonthList.map((m) => (
                  <MenuItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>To Year</InputLabel>
              <Select
                name="toYear"
                value={String(reportSettings.toYear)}
                label="To Year"
                onChange={handleChangeSettings}
              >
                {YEAR_OPTIONS.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {!periodValid && (
            <Grid size={12}>
              <Alert severity="warning">
                The To month can't be before the From month.
              </Alert>
            </Grid>
          )}

          {/* Class Selection */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                name="classId"
                value={reportSettings?.classId}
                label="Select Class"
                onChange={handleChangeSettings}
              >
                {classes.map((c) => (
                  <MenuItem key={c.externalId} value={c.externalId}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Select Students</InputLabel>
              <Select
                name="studentIds"
                multiple
                label="Select Students"
                value={reportSettings?.studentIds}
                onChange={handleChangeSettings}
                disabled={!reportSettings?.classId}
                renderValue={(selected) => {
                  const selectedIds = selected as string[];

                  const names = classStudents
                    .filter((student) =>
                      selectedIds.includes(student.externalId)
                    )
                    .map(
                      (student) => `${student.firstName} ${student.lastName}`
                    );

                  return names.join(', ');
                }}
              >
                {classStudents.map((student) => (
                  <MenuItem key={student.externalId} value={student.externalId}>
                    <Checkbox
                      checked={reportSettings?.studentIds?.includes(
                        student.externalId
                      )}
                    />
                    <ListItemText
                      primary={`${student.firstName} ${student.lastName}`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', mt: 2, justifyContent: 'end' }}>
          <Button
            disabled={reportSettings?.studentIds?.length === 0 || !periodValid}
            variant="contained"
            onClick={handleGenerateReport}
          >
            Generate Reports
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportSettings;
