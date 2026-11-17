import { useEffect, useMemo, useRef, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  importTests,
  type TestImportField,
} from '../../../../redux/slices/testSlice';
import ImportPanel from '../../../../common/import/ImportPanel';
import type { ImportColumn } from '../../../../common/import/readSheet';
import type {
  ImportCheck,
  ImportResult,
} from '../../../../common/import/importTypes';

const CLASS_COLUMN: ImportColumn<TestImportField> = {
  field: 'className',
  label: 'Class',
  aliases: ['Class name', 'Grade'],
  required: true,
  example: '9th',
};

const COLUMNS: ImportColumn<TestImportField>[] = [
  {
    field: 'name',
    label: 'Test name',
    aliases: ['Test', 'Name'],
    required: true,
    example: 'Test 1',
  },
  {
    field: 'testType',
    label: 'Type',
    aliases: ['Test type', 'Monthly or session'],
    required: true,
    example: 'Monthly',
  },
  {
    field: 'month',
    label: 'Month',
    example: 'April',
  },
  {
    field: 'year',
    label: 'Year',
    example: '2026',
  },
  {
    field: 'testDate',
    label: 'Date',
    aliases: ['Test date', 'Session date'],
  },
  {
    field: 'subject',
    label: 'Subject',
    aliases: ['Subject name'],
    required: true,
    example: 'English',
  },
  {
    field: 'maxMarks',
    label: 'Max marks',
    aliases: ['Maximum marks', 'Total marks', 'Out of', 'Marks'],
    example: '100',
  },
];

export default function ImportTests({
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
  // '' reads each row's Class column
  const [classId, setClassId] = useState('');
  const wasOpen = useRef(false);

  // Set when the panel opens, not again while it is open
  useEffect(() => {
    if (open && !wasOpen.current) setClassId(defaultClassId ?? '');
    wasOpen.current = open;
  }, [open, defaultClassId]);

  const columns = useMemo(
    () => (classId ? COLUMNS : [CLASS_COLUMN, ...COLUMNS]),
    [classId]
  );

  const check: ImportCheck<TestImportField> = async (rows, dryRun) => {
    const result = await dispatch(
      importTests({ rows, dryRun, classId: classId || undefined })
    );
    return importTests.fulfilled.match(result)
      ? { ok: true, ...result.payload }
      : { ok: false, message: result.payload as string };
  };

  return (
    <ImportPanel
      open={open}
      onClose={onClose}
      title="Import tests"
      noun={['test', 'tests']}
      columns={columns}
      templateName="Tests template.xlsx"
      labelHeading="Test and subject"
      intro="Add tests from an Excel or CSV file, one row for each subject of a test. Rows with the same test name, type and month (or date) become one test. A monthly test needs Month and Year; a session test needs its Date. Max marks left blank take the subject's own. Tests already in the class are skipped."
      optionsKey={classId}
      check={check}
      onImported={onImported}
      options={
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
      }
    />
  );
}
