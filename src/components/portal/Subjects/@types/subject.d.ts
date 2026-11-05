import type { SubjectType } from '../../../../@types/global';

// Real `/subject` API shape (see edutracker-backend SubjectService.getAllSubjects).
export type SubjectClassRef = {
  externalId: string;
  name: string;
};

export type ApiSubject = {
  externalId: string;
  name: string;
  isActive: boolean;
  subjectType: SubjectType;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
  classes?: SubjectClassRef[];
};

export type SubjectFormValues = {
  name: string;
  subjectType: SubjectType;
  maxMarks: number;
};

// Real `/grade-scale` API shape (see edutracker-backend GradeService).
export type ApiGradeScale = {
  externalId: string;
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

export type GradeScaleFormValues = {
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  remarks: string;
};
