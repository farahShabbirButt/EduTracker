// TestMarksEntry.tsx

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  ClassLevelsList,
  DummyTestMarks,
  DummyTests,
  StudentsSampleData,
  SubjectsList,
} from '../../../config/constants';
import type { ITestMarkEntry } from './@types/testData';

const uid = () => Math.random().toString(36).slice(2);

export default function TestMarksEntry() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  const selectedTest = useMemo(
    () => DummyTests.find((t) => t.id === selectedTestId),
    [selectedTestId]
  );

  const filteredStudents = useMemo(() => {
    if (!selectedTest) return [];
    return StudentsSampleData.filter(
      (s) => (s.class?.name ?? '') === selectedTest.classLevel
    );
  }, [selectedTest]);

  const handleSave = () => {
    filteredStudents.forEach((s) => {
      const input = (
        document.getElementById(`marks-${s.externalId}`) as HTMLInputElement
      )?.value;

      const obtained = Number(input || 0);

      const entry: ITestMarkEntry = {
        id: uid(),
        testId: selectedTestId,
        studentId: s.externalId,
        subjectId: selectedSubjectId,
        obtainedMarks: obtained,
        maxMarks: maxMarks,
      };

      DummyTestMarks.push(entry);
    });

    alert('Marks Saved Successfully!');
  };

  //Flow for Monthly Marks Entry
  // select Class
  // Get tests for that class
  // Then select test
  // Then Select Subject
  // Get the students of that selected class and Subject
  // Enter Marks for test
  // Enter marks in list of students

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Test Marks Entry
      </Typography>

      {/* Class SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Class"
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        sx={{ mb: 2 }}
      >
        {ClassLevelsList.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {/* TEST SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Test"
        value={selectedTestId}
        onChange={(e) => setSelectedTestId(e.target.value)}
        sx={{ mb: 2 }}
        disabled={!selectedClassId}
      >
        {DummyTests.map((t) => (
          <MenuItem key={t.id} value={t.id}>
            {t.testName} — {t.classLevel} ({t.month}/{t.year})
          </MenuItem>
        ))}
      </TextField>

      {/* SUBJECT SELECTION */}
      <TextField
        fullWidth
        select
        label="Select Subject"
        sx={{ mb: 2 }}
        value={selectedSubjectId}
        disabled={!selectedTestId}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedSubjectId(id);

          const sub = SubjectsList.find((s) => s.id === id);
          if (sub) setMaxMarks(sub.defaultMaxMarks);
        }}
      >
        {SubjectsList.filter(
          (s) => s.grades && s.grades.includes(selectedTest?.classLevel || '')
        ).map((subj) => (
          <MenuItem key={subj.id} value={subj.id}>
            {subj.name}
          </MenuItem>
        ))}
      </TextField>

      {/* MAX MARKS */}
      <TextField
        type="number"
        label="Max Marks"
        fullWidth
        value={maxMarks}
        onChange={(e) => setMaxMarks(Number(e.target.value))}
        sx={{ mb: 3 }}
        disabled={!selectedSubjectId}
      />

      {/* STUDENT MARKS TABLE */}
      {selectedSubjectId && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Obtained Marks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((st) => (
              <TableRow key={st.id}>
                <TableCell>
                  {st.firstName} {st.lastName}
                </TableCell>
                <TableCell>
                  <input
                    id={`marks-${st.externalId}`}
                    type="number"
                    style={{
                      width: '100px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedSubjectId && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Marks
          </Button>
        </Box>
      )}
    </Paper>
  );
}
