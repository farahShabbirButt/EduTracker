import { useEffect, useMemo, useRef, useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  importStudents,
  type StudentImportField,
} from '../../../../redux/slices/studentSlice';
import ImportPanel from '../../../../common/import/ImportPanel';
import type { ImportColumn } from '../../../../common/import/readSheet';
import type {
  ImportCheck,
  ImportResult,
} from '../../../../common/import/importTypes';

const CLASS_COLUMN: ImportColumn<StudentImportField> = {
  field: 'className',
  label: 'Class',
  aliases: ['Class name', 'Grade'],
  required: true,
  example: '9th',
};

const COLUMNS: ImportColumn<StudentImportField>[] = [
  {
    field: 'rollNumber',
    label: 'Roll no',
    aliases: ['Roll number', 'Roll #', 'Roll', 'Admission no'],
    required: true,
    example: '1',
  },
  {
    field: 'firstName',
    label: 'First name',
    aliases: ['Name', 'Student name', 'Student'],
    required: true,
    example: 'Ali',
  },
  {
    field: 'lastName',
    label: 'Last name',
    aliases: ['Surname'],
    example: 'Khan',
  },
  {
    field: 'fatherName',
    label: "Father's name",
    aliases: ['Father name', 'F/Name', 'Father', 'Guardian', 'Guardian name'],
    required: true,
    example: 'Imran Khan',
  },
  {
    field: 'contactNo',
    label: 'Phone',
    aliases: ['Contact', 'Contact no', 'Mobile', 'Phone number', 'Cell'],
    example: '03001234567',
  },
  {
    field: 'email',
    label: 'Email',
    aliases: ['E-mail', 'Email address'],
  },
  {
    field: 'electives',
    label: 'Electives',
    aliases: ['Elective subjects', 'Elective', 'Optional subjects'],
    example: 'Computer',
  },
  {
    field: 'joinedOn',
    label: 'Joined on',
    aliases: ['Admission date', 'Date of admission', 'Joining date', 'Joined'],
  },
];

// Today on this computer, as the date box shows it
const today = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');
};

export default function ImportStudents({
  open,
  onClose,
  defaultClassId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  // The class the list is filtered to, if any
  defaultClassId?: string;
  onImported: (message: string, result: ImportResult) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((state: RootState) => state.classes);
  const schoolYearStart = useSelector(
    (state: RootState) => state.institute.institute?.schoolYearStartDate
  );
  // '' reads each row's Class column
  const [classId, setClassId] = useState('');
  const [joinedOn, setJoinedOn] = useState('');

  // Set when the panel opens, not again while it is open: a late Settings load
  // must not undo a class or date already picked
  const [touchedDate, setTouchedDate] = useState(false);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setClassId(defaultClassId ?? '');
      setJoinedOn(schoolYearStart ?? today());
      setTouchedDate(false);
    }
    wasOpen.current = open;
  }, [open, defaultClassId, schoolYearStart]);

  // Settings may arrive after the panel opened; use it unless a date was picked
  useEffect(() => {
    if (open && schoolYearStart && !touchedDate) setJoinedOn(schoolYearStart);
  }, [open, schoolYearStart, touchedDate]);

  const columns = useMemo(
    () => (classId ? COLUMNS : [CLASS_COLUMN, ...COLUMNS]),
    [classId]
  );
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(joinedOn) && joinedOn <= today();

  const check: ImportCheck<StudentImportField> = async (rows, dryRun) => {
    const result = await dispatch(
      importStudents({
        rows,
        dryRun,
        classId: classId || undefined,
        joinedOn,
      })
    );
    return importStudents.fulfilled.match(result)
      ? { ok: true, ...result.payload }
      : { ok: false, message: result.payload as string };
  };

  return (
    <ImportPanel
      open={open}
      onClose={onClose}
      title="Import students"
      noun={['student', 'students']}
      columns={columns}
      templateName="Students template.xlsx"
      labelHeading="Student"
      intro="Add a class register from an Excel or CSV file, one student per row. Students whose roll number is already in the class are skipped. Each new student gets the class's compulsory subjects, plus any electives listed."
      optionsKey={`${classId}|${joinedOn}`}
      ready={dateOk}
      check={check}
      onImported={onImported}
      options={
        <Stack spacing={2}>
          <TextField
            select
            size="small"
            label="Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            helperText={
              classId
                ? 'Every row goes into this class. A Class column is ignored.'
                : 'Each row names its class in a Class column.'
            }
          >
            <MenuItem value="">Use the Class column in the file</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.externalId} value={c.externalId}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            size="small"
            label="Joined class on"
            value={joinedOn}
            onChange={(e) => {
              setTouchedDate(true);
              setJoinedOn(e.target.value);
            }}
            error={!dateOk}
            helperText={
              !dateOk
                ? "Pick a date that isn't in the future"
                : 'Students owe the tests from this date on. A Joined on column overrides it for a row.'
            }
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { max: today() },
            }}
          />
        </Stack>
      }
    />
  );
}
