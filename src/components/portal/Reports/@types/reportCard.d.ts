// Mirrors the backend's `IReportCard` (edutracker-backend `report.types.ts`).
// The frontend never re-derives these numbers — it renders exactly what
// `GET /report/student/:externalId` returns.
export interface IReportCardSubjectColumn {
  externalId: string;
  name: string;
}

export interface IReportCardRow {
  testName: string;
  // A subject externalId absent from this map was not examined in this test —
  // the card must render a blank cell for it, never a substituted 0.
  marks: Record<string, { obtained: number; max: number }>;
  total: number;
  maxTotal: number;
  percentage: number;
  grade: string;
}

export interface IReportCardOverall {
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'PASS' | 'FAIL';
  remarks: string;
}

export interface IReportCardPosition {
  rank: number;
  outOf: number;
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
  // Authoritative column order — never derive columns from a row's `marks`.
  subjects: IReportCardSubjectColumn[];
  rows: IReportCardRow[];
  subjectTotals: Record<string, { obtained: number; max: number }>;
  overall: IReportCardOverall;
  conduct: { behaviour: string | null; uniformCleanliness: string | null };
  position: IReportCardPosition | null;
}
