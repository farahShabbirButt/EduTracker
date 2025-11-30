import type { Grade, SubjectType } from '../../../../@types/global';

export type Subject = {
  id: string;
  name: string;
  defaultMaxMarks: number; // e.g. 100
  grades?: Grade[];
  subjectType: SubjectType;
};

export type GradeBoundary = {
  label: string; // A+, A, B+...
  min: number; // minimum percentage (0-100)
};
