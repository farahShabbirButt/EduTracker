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

// Real `/subject` API shape (see edutracker-backend SubjectService.getAllSubjects).
export type SubjectClassRef = {
  externalId: string;
  name: string;
};

export type ApiSubject = {
  id: number;
  externalId: string;
  name: string;
  isActive: boolean;
  subjectType: SubjectType;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  classes?: SubjectClassRef[];
};

export type SubjectFormValues = {
  name: string;
  subjectType: SubjectType;
  maxMarks: number;
};

// Real `/grade-scale` API shape (see edutracker-backend GradeService).
export type ApiGradeScale = {
  id: number;
  externalId: string;
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export type GradeScaleFormValues = {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  remarks: string;
};
