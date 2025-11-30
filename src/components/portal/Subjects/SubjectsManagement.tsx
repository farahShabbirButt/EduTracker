import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import type { GradeBoundary, Subject } from './@types/subject';
import { SubjectType, type ClassLevel } from '../../../@types/global.d';
import {
  ClassLevels,
  GradesList,
  SubjectsList,
} from '../../../config/constants';
import SubjectListing from './Partial/SubjectsListing';
import SubjectDialog from './Partial/SubjectsDialog';
import AssignToClasses from './Partial/AssignToClasses';
import GradeBoundariesDialog from './Partial/GradeBoundries';

const uid = () => Math.random().toString(36).slice(2);

export default function SubjectsManagement() {
  const [subjects, setSubjects] = React.useState<Subject[]>(SubjectsList);
  const [boundaries, setBoundaries] =
    React.useState<GradeBoundary[]>(GradesList);

  const [gradeFilter, setGradeFilter] = React.useState<'' | ClassLevel>('');
  const [search, setSearch] = React.useState('');
  const [openEdit, setOpenEdit] = React.useState<Subject | null>(null);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openAssign, setOpenAssign] = React.useState(false);
  const [openBoundaries, setOpenBoundaries] = React.useState(false);

  const filtered = React.useMemo(() => {
    let rows = subjects;
    if (gradeFilter) rows = rows.filter((s) => s.grades?.includes(gradeFilter));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((s) => s.name.toLowerCase().includes(q));
    }
    return rows;
  }, [subjects, gradeFilter, search]);

  const upsertSubject = (
    payload: {
      name: string;
      defaultMaxMarks: number;
      subjectType: SubjectType;
    },
    editing?: Subject
  ) => {
    if (editing) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                name: payload.name,
                defaultMaxMarks: payload.defaultMaxMarks,
              }
            : s
        )
      );
    } else {
      setSubjects((prev) => [
        ...prev,
        {
          id: uid(),
          name: payload.name,
          defaultMaxMarks: payload.defaultMaxMarks,
          grades: [],
          subjectType: payload.subjectType,
        },
      ]);
    }
  };

  const deleteSubject = (row: Subject) => {
    if (!confirm(`Delete subject "${row.name}"?`)) return;
    setSubjects((prev) => prev.filter((s) => s.id !== row.id));
  };

  const getAssignedForGrade = (grade: ClassLevel): Subject[] =>
    subjects.filter((s) => s.grades?.includes(grade));

  const saveAssignments = (grade: ClassLevel, subjectIds: string[]) => {
    setSubjects((prev) =>
      prev.map((s) => {
        const has = subjectIds.includes(s.id);
        const existing = new Set(s.grades ?? []);
        if (has) {
          existing.add(grade);
        } else {
          existing.delete(grade);
        }
        return { ...s, grades: Array.from(existing) as ClassLevel[] };
      })
    );
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardHeader
          title="Subject Management"
          subheader="Add subjects, set max marks, and grade boundaries"
        />
        <Divider />
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Search subjects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <TextField
              select
              label="Filter by Class level"
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value as ClassLevel | '')
              }
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Grades</MenuItem>
              {ClassLevels.map((g) => (
                <MenuItem key={g} value={g}>
                  {g === 'KG' || g === 'Nursery' ? g : `Class ${g}`}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flex: 1 }} />
            <Button
              startIcon={<LinkIcon />}
              variant="outlined"
              onClick={() => setOpenAssign(true)}
            >
              Assign to Grades
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              variant="outlined"
              onClick={() => setOpenBoundaries(true)}
            >
              Grade Boundaries
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setOpenAdd(true)}
            >
              Add Subject
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <SubjectListing
        rows={filtered}
        onEdit={(row) => setOpenEdit(row)}
        onDelete={deleteSubject}
      />

      {/* Add */}
      <SubjectDialog
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        onSave={(data) => {
          upsertSubject(data);
          setOpenAdd(false);
        }}
      />

      {/* Edit */}
      <SubjectDialog
        open={!!openEdit}
        initial={openEdit ?? undefined}
        onCancel={() => setOpenEdit(null)}
        onSave={(data) => {
          if (openEdit) upsertSubject(data, openEdit);
          setOpenEdit(null);
        }}
      />

      {/* Assign */}
      <AssignToClasses
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        allSubjects={subjects}
        getAssignedForGrade={getAssignedForGrade}
        onSave={(grade, subjectIds) => {
          saveAssignments(grade, subjectIds);
          setOpenAssign(false);
        }}
      />

      {/* Boundaries */}
      <GradeBoundariesDialog
        open={openBoundaries}
        initial={boundaries}
        onClose={() => setOpenBoundaries(false)}
        onSave={(b) => {
          setBoundaries(b);
          setOpenBoundaries(false);
        }}
      />
    </Stack>
  );
}
