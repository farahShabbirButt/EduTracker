import {
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

interface IReportSettingsProps {
  reportSettings: IReportSettings;
  handleGenerateReport: () => void;
  handleChangeSettings: (e: SelectChangeEvent<string | string[]>) => void;
}

// A school won't have monthly data far outside "now" — the year is a plain
// filter on the report endpoint, not something derived from loaded data.
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

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

          {/* Year Selection */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={String(reportSettings?.year)}
                label="Year"
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
            disabled={reportSettings?.studentIds?.length === 0}
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
