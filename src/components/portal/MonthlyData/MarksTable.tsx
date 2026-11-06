import type { KeyboardEvent } from 'react';
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import type { MarksGrid } from '../../../redux/slices/scoreSlice';

export const cellKey = (studentId: string, subjectId: string) =>
  `${studentId}:${subjectId}`;

// Mirrors marks validation in the backend's studentScore.validation.ts
export const markProblem = (value: string, max: number) => {
  const text = value.trim();
  if (text === '') return null;
  if (text.startsWith('-')) return "Marks can't be negative";
  if (!/^\d+(\.\d+)?$/.test(text)) return 'Enter a number';
  const mark = Number(text);
  if (mark > max) return `Maximum is ${max}`;
  if ((mark * 2) % 1 !== 0) return 'Marks must be whole or half';
  return null;
};

const stickyCell = {
  position: 'sticky',
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
} as const;

const MarksTable = ({
  grid,
  typed,
  disabled,
  onChange,
}: {
  grid: MarksGrid;
  typed: Record<string, string>;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
}) => {
  const moveFocus = (
    event: KeyboardEvent<HTMLInputElement>,
    row: number,
    column: number
  ) => {
    const step =
      event.key === 'ArrowUp'
        ? -1
        : event.key === 'ArrowDown' || event.key === 'Enter'
          ? 1
          : 0;
    if (!step) return;
    event.preventDefault();
    const table = event.currentTarget.closest('table');
    // A student who doesn't take the subject has no input: walk on to the next
    for (
      let target = row + step;
      target >= 0 && target < grid.students.length;
      target += step
    ) {
      const next = table?.querySelector<HTMLInputElement>(
        `input[data-row="${target}"][data-column="${column}"]`
      );
      if (next) {
        next.focus();
        next.select();
        return;
      }
    }
  };

  const owing = (subjectId: string) =>
    grid.students.filter((student) => student.cells[subjectId]?.owed);

  const entered = (subjectId: string) =>
    owing(subjectId).filter(
      (student) =>
        (typed[cellKey(student.externalId, subjectId)] ?? '').trim() !== ''
    ).length;

  return (
    // Relative, so the hidden screen-reader text stays inside the scrolling box
    <TableContainer sx={{ position: 'relative' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...stickyCell, bgcolor: 'background.secondary' }}>
              Student
            </TableCell>
            {grid.subjects.map((subject) => (
              <TableCell
                key={subject.externalId}
                align="center"
                sx={{ whiteSpace: 'nowrap' }}
              >
                {subject.name}
                <Typography variant="caption" display="block">
                  out of {subject.maxMarks}
                </Typography>
                <Typography variant="caption" display="block">
                  {entered(subject.externalId)} of{' '}
                  {owing(subject.externalId).length}
                </Typography>
              </TableCell>
            ))}
            <TableCell align="center">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grid.students.map((student, row) => {
            const name = [student.firstName, student.lastName]
              .filter(Boolean)
              .join(' ');
            const total = grid.subjects.reduce((sum, subject) => {
              const value = Number(
                typed[cellKey(student.externalId, subject.externalId)]
              );
              return sum + (Number.isNaN(value) ? 0 : value);
            }, 0);

            return (
              <TableRow key={student.externalId}>
                <TableCell sx={{ ...stickyCell, whiteSpace: 'nowrap' }}>
                  <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
                  <Typography variant="caption">
                    Roll {student.rollNumber}
                  </Typography>
                  {student.leftClass && (
                    <Chip size="small" label="Left class" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                {grid.subjects.map((subject, column) => {
                  const cell = student.cells[subject.externalId];
                  const key = cellKey(student.externalId, subject.externalId);
                  const value = typed[key] ?? '';
                  const problem = markProblem(value, subject.maxMarks);
                  const empty = value.trim() === '' && cell?.owed;

                  return (
                    <TableCell
                      key={subject.externalId}
                      align="center"
                      sx={{ px: 0.75 }}
                    >
                      {cell?.editable ? (
                        <Box
                          component="input"
                          inputMode="decimal"
                          aria-label={`${name}, ${subject.name}, out of ${subject.maxMarks}`}
                          aria-invalid={Boolean(problem)}
                          title={problem ?? undefined}
                          data-row={row}
                          data-column={column}
                          data-state={
                            problem ? 'invalid' : empty ? 'empty' : 'filled'
                          }
                          value={value}
                          disabled={disabled}
                          onChange={(e) =>
                            onChange(key, (e.target as HTMLInputElement).value)
                          }
                          onKeyDown={(e) =>
                            moveFocus(
                              e as KeyboardEvent<HTMLInputElement>,
                              row,
                              column
                            )
                          }
                          sx={(theme) => {
                            const c = theme.palette.studio;
                            return {
                              width: 62,
                              height: 44,
                              textAlign: 'center',
                              font: 'inherit',
                              fontWeight: 700,
                              color: problem ? c.red : c.ink,
                              bgcolor: problem
                                ? c.redSoft
                                : empty
                                  ? c.amberSoft
                                  : c.surface,
                              border: `1px ${empty ? 'dashed' : 'solid'} ${problem ? c.red : empty ? c.amber : c.line}`,
                              borderRadius: `${theme.studio.radii.small}px`,
                              transition: `background-color ${theme.studio.motion.medium}, border-color ${theme.studio.motion.medium}, box-shadow ${theme.studio.motion.medium}, transform ${theme.studio.motion.fast} ${theme.studio.motion.ease}`,
                              '&:focus': {
                                outline: 0,
                                borderColor: c.primaryBright,
                                boxShadow: `0 0 0 3px ${c.tint}`,
                                transform: 'scale(1.05)',
                              },
                            };
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: 'text.disabled' }}>
                          <span aria-hidden="true">–</span>
                          <Box
                            component="span"
                            sx={visuallyHidden}
                          >{`${name} doesn't take ${subject.name}`}</Box>
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  {total}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MarksTable;
