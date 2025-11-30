export interface MonthlySubjectMark {
  subjectId: string;
  obtainedMarks: number | '';
  maxMarks: number;
}

export interface MonthlyEntryRow {
  studentId: string;
  studentName: string;
  marks: MonthlySubjectMark[];
  total: number;
  percentage: number;
  grade: string;
}

export interface MonthlyDataPayload {
  month: string;
  year: number;
  entries: MonthlyEntryRow[];
}

export interface LocalGradeBoundary {
  label: string;
  min: number;
}
