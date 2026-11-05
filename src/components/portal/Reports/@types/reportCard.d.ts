// Mirrors the backend's `IReportCard` (edutracker-backend `report.types.ts`).
// The frontend never re-derives these numbers — it renders exactly what
// `GET /report/student/:externalId` returns.
export interface IReportCardSubjectColumn {
  externalId: string;
  name: string;
}

export interface IReportCardRow {
  testExternalId: string;
  testName: string;
  month: number;
  year: number;
  // No key: the student wasn't examined in that subject. obtained null: the
  // mark isn't entered yet. Both print blank, never a substituted 0.
  marks: Record<string, { obtained: number | null; max: number }>;
  // Entered marks only, and the max of those subjects
  total: number;
  maxTotal: number;
  // null while nothing is entered
  percentage: number | null;
  grade: string | null;
}

export interface IReportCardOverall {
  obtainedMarks: number;
  totalMarks: number;
  percentage: number | null;
  grade: string | null;
  status: 'PASS' | 'FAIL' | null;
  remarks: string;
}

export interface IReportCardPosition {
  rank: number;
  outOf: number;
  // Someone in the class still has marks to enter, so this can change
  provisional: boolean;
}

export interface IReportPeriod {
  from: { month: number; year: number };
  to: { month: number; year: number };
}

export interface IReportCard {
  institute: { name: string; address: string; phone: string };
  student: {
    name: string;
    fatherName: string;
    class: string;
    rollNumber: string;
  };
  title: string;
  period: IReportPeriod;
  // Authoritative column order — never derive columns from a row's `marks`.
  subjects: IReportCardSubjectColumn[];
  rows: IReportCardRow[];
  subjectTotals: Record<string, { obtained: number; max: number }>;
  overall: IReportCardOverall;
  conduct: { behaviour: string | null; uniformCleanliness: string | null };
  position: IReportCardPosition | null;
  missingMarks: { testName: string; subjectName: string }[];
}
