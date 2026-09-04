// ResultCard.tsx
import { forwardRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import type { IReportCard } from '../portal/Reports/@types/reportCard.d';

type ResultCardProps = {
  data: IReportCard;
};

const border = '1px solid #000';

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ data }, ref) => {
    // Columns come from the endpoint's explicit `subjects` list — NEVER from a
    // single row's `marks`. A test that omits a subject (e.g. the real card's
    // Test 8 omitting Al Quran and Islamiat) must not be able to drop that
    // subject's column, and this also keeps an empty `rows: []` from crashing.
    const subjectList = data.subjects;
    const hasRows = data.rows.length > 0;

    return (
      <Box ref={ref} className="card-root" sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {data.institute.name}
          </Typography>
          <Typography variant="caption">
            {data.institute.address}, {data.institute.phone}
          </Typography>
        </Box>

        <Typography align="center" sx={{ fontWeight: 700, mb: 1 }}>
          {data.title}
        </Typography>

        {/* Student info */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5, fontWeight: 700 }}>STUDENT’S NAME</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5 }}>{data.student.name}</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5, fontWeight: 700 }}>FATHER’S NAME</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5 }}>{data.student.fatherName}</Box>
          </Grid>

          <Grid size={3}>
            <Box sx={{ border, p: 0.5, fontWeight: 700 }}>CLASS</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5 }}>{data.student.class}</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5, fontWeight: 700 }}>ROLL NO.</Box>
          </Grid>
          <Grid size={3}>
            <Box sx={{ border, p: 0.5 }}>{data.student.rollNumber}</Box>
          </Grid>
        </Grid>

        {/* Results table — a year with no tests yet returns `rows: []`; render
            a graceful empty state instead of a table with no data. */}
        {hasRows ? (
          <Table size="small" sx={{ border }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ border, fontWeight: 700 }}>
                  Subjects / Tests
                </TableCell>
                {subjectList.map((s) => (
                  <TableCell
                    key={s.externalId}
                    align="center"
                    sx={{ border, fontWeight: 700 }}
                  >
                    {s.name}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ border, fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ border, fontWeight: 700 }}>
                  %
                </TableCell>
                <TableCell align="center" sx={{ border, fontWeight: 700 }}>
                  Grade
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.testName}>
                  <TableCell sx={{ border }}>{row.testName}</TableCell>
                  {subjectList.map((s) => {
                    // Present in `marks` -> render obtained. Absent -> the
                    // subject wasn't examined in this test, render a blank
                    // cell. A blank and a zero are different facts.
                    const cell = row.marks[s.externalId];
                    return (
                      <TableCell
                        key={s.externalId}
                        align="center"
                        sx={{ border }}
                      >
                        {cell ? cell.obtained : ''}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ border }}>
                    {row.total}
                  </TableCell>
                  <TableCell align="center" sx={{ border }}>
                    {row.percentage.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ border }}>
                    {row.grade}
                  </TableCell>
                </TableRow>
              ))}

              {/* Subject Total row — server-computed per subject, not
                  re-derived here. */}
              <TableRow>
                <TableCell sx={{ border, fontWeight: 700 }}>
                  Subject Total
                </TableCell>
                {subjectList.map((s) => (
                  <TableCell
                    key={s.externalId}
                    align="center"
                    sx={{ border, fontWeight: 700 }}
                  >
                    {data.subjectTotals[s.externalId]?.obtained ?? 0}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ border, fontWeight: 700 }}>
                  {data.overall.obtainedMarks}
                </TableCell>
                <TableCell align="center" sx={{ border }} />
                <TableCell align="center" sx={{ border }} />
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ border, p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No test records found for this year.
            </Typography>
          </Box>
        )}

        {/* Behaviour / cleanliness */}
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid size={6}>
            <Box sx={{ border, p: 0.5 }}>
              Behaviour: <b>{data.conduct.behaviour || '—'}</b>
            </Box>
          </Grid>
          <Grid size={6}>
            <Box sx={{ border, p: 0.5 }}>
              Uniform & Cleanliness:{' '}
              <b>{data.conduct.uniformCleanliness || '—'}</b>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* Overall */}
        <Grid container spacing={1}>
          <Grid size={4}>
            <Box sx={{ border, p: 1 }}>
              <Typography fontWeight={700}>OVERALL RESULT</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Obtained Marks</TableCell>
                    <TableCell align="right">
                      {data.overall.obtainedMarks}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Marks</TableCell>
                    <TableCell align="right">
                      {data.overall.totalMarks}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>%</TableCell>
                    <TableCell align="right">
                      {data.overall.percentage.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Grade</TableCell>
                    <TableCell align="right">{data.overall.grade}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">{data.overall.status}</TableCell>
                  </TableRow>
                  {data.position && (
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell align="right">
                        {data.position.rank} / {data.position.outOf}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Grid>
          <Grid size={8}>
            <Box sx={{ border, p: 1, height: '100%' }}>
              <Typography fontWeight={700} gutterBottom>
                Remarks
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {data.overall.remarks || ''}
              </Typography>
              <Grid container sx={{ mt: 5 }}>
                <Grid size={6}>
                  <Typography>
                    Principal’s Signature __________________
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography align="right">
                    Parent’s Signature __________________
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
);
