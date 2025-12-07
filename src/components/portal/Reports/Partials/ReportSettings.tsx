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
import { TestType } from '../../../../@types/global.d';
import {
  ClassLevelsList,
  DummyTests,
  StudentsSampleData,
} from '../../../../config/constants';

interface IReportSettingsProps {
  reportSettings: IReportSettings;
  handleGenerateReport: () => void;
  handleChangeSettings: (e: SelectChangeEvent<string | string[]>) => void;
}
const ReportSettings = ({
  reportSettings,
  handleGenerateReport,
  handleChangeSettings,
}: IReportSettingsProps) => {
  return (
    <Card>
      <CardHeader
        title="Report Settings"
        subheader="Choose Settings for you reports once and generate reports as many as you want"
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {/* Report Mode */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Report Mode</InputLabel>
              <Select
                name="reportMode"
                value={reportSettings?.reportMode}
                label="Report Mode"
                onChange={handleChangeSettings}
              >
                <MenuItem value={TestType.MONTHLY}>Monthly </MenuItem>
                <MenuItem value={TestType.TEST_SESSION}>Test Session</MenuItem>
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
                {ClassLevelsList.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Test Selection : Filter Base on selected type of Test */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Select Test</InputLabel>
              <Select
                name="testId"
                value={reportSettings?.testId}
                label="Select Test"
                onChange={handleChangeSettings}
                disabled={!reportSettings?.classId}
              >
                {DummyTests.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.testName} — {t.classLevel} ({t.month}/{t.year})
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
                disabled={!reportSettings?.classId || !reportSettings?.testId}
                renderValue={(selected) => {
                  const selectedIds = selected as string[];

                  const names = StudentsSampleData.filter((student) =>
                    selectedIds.includes(student.id)
                  ).map(
                    (student) => `${student.firstName} ${student.lastName}`
                  );

                  return names.join(', ');
                }}
              >
                {StudentsSampleData?.map((student) => (
                  <MenuItem value={student?.id}>
                    <Checkbox
                      checked={reportSettings?.studentIds?.includes(
                        student?.id
                      )}
                    />
                    <ListItemText
                      primary={`${student?.firstName} ${student?.lastName}`}
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
