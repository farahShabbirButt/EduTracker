// TestCreationModal.tsx

import { useState, useEffect } from 'react';
import { TextField, MenuItem, Button, Typography, Box } from '@mui/material';
import {
  ClassLevels,
  DummyTests,
  MonthList,
} from '../../../../config/constants';
import type { ITest } from '../@types/testData';

const uid = () => Math.random().toString(36).slice(2);

export default function TestModal({
  onClose,
  editTestId,
}: {
  onClose: () => void;
  editTestId: string | null;
}) {
  const editing = Boolean(editTestId);

  const existingTest = editing
    ? DummyTests.find((t) => t.id === editTestId)
    : null;

  const [form, setForm] = useState({
    testName: '',
    month: '',
    year: new Date().getFullYear(),
    classLevel: '',
  });

  useEffect(() => {
    if (existingTest) {
      setForm({
        testName: existingTest.testName,
        month: String(existingTest.month),
        year: existingTest.year,
        classLevel: existingTest.classLevel,
      });
    }
  }, [existingTest]);

  const handleChange = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (editing) {
      existingTest!.testName = form.testName;
      existingTest!.month = Number(form.month);
      existingTest!.year = Number(form.year);
      existingTest!.classLevel = form.classLevel;
    } else {
      const newTest: ITest = {
        id: uid(),
        testName: form.testName,
        month: Number(form.month),
        year: Number(form.year),
        classLevel: form.classLevel,
        createdAt: new Date().toISOString(),
      };

      DummyTests.push(newTest);
    }

    onClose();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {editing ? 'Edit Test' : 'Add New Test'}
      </Typography>

      <TextField
        label="Test Name"
        fullWidth
        sx={{ mb: 2 }}
        value={form.testName}
        onChange={(e) => handleChange('testName', e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Select Month"
        sx={{ mb: 2 }}
        value={form.month}
        onChange={(e) => handleChange('month', e.target.value)}
      >
        {MonthList.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            {m.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="number"
        label="Year"
        fullWidth
        sx={{ mb: 2 }}
        value={form.year}
        onChange={(e) => handleChange('year', e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Class Level"
        sx={{ mb: 2 }}
        value={form.classLevel}
        onChange={(e) => handleChange('classLevel', e.target.value)}
      >
        {ClassLevels.map((cls) => (
          <MenuItem key={cls} value={cls}>
            {cls}
          </MenuItem>
        ))}
      </TextField>

      <Button variant="contained" onClick={handleSave} fullWidth sx={{ mt: 1 }}>
        {editing ? 'Update Test' : 'Create Test'}
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        fullWidth
        sx={{ mt: 1 }}
      >
        Cancel
      </Button>
    </Box>
  );
}
