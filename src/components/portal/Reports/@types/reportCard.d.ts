// Mirrors the backend's `IReportCard` (edutracker-backend `report.types.ts`).
// The frontend never re-derives these numbers — it renders exactly what
// `GET /report/student/:externalId` returns.
export interface IReportCardSubjectColumn {
  externalId: string;
  name: string;
}

export type ReportMode = 'MONTHLY' | 'SESSION';

export interface IReportCardRow {
  // null on the summary row
  testExternalId: string | null;
  testName: string;
  month: number;
  year: number;
  // A session test's day, YYYY-MM-DD
  testDate: string | null;
  // A session card's earlier tests added up into one row, e.g. "Test 1 – Test 8"
  summary: boolean;
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

// What a card is asked for: monthly tests over months, or one class's session
// tests from one test to another
export type IReportRequest =
  | { mode: 'MONTHLY'; period: IReportPeriod }
  | {
      mode: 'SESSION';
      fromTestExternalId: string;
      toTestExternalId: string;
      earlierAsRow: boolean;
    };

export interface IReportCard {
  institute: {
    name: string;
    address: string;
    phone: string;
    logo: string | null;
  };
  student: {
    name: string;
    fatherName: string;
    class: string;
    rollNumber: string;
  };
  mode: ReportMode;
  title: string;
  period: IReportPeriod;
  // Session cards: the first and last test, for the period line
  range: { from: string; to: string } | null;
  // Authoritative column order — never derive columns from a row's `marks`.
  subjects: IReportCardSubjectColumn[];
  rows: IReportCardRow[];
  subjectTotals: Record<string, { obtained: number; max: number }>;
  overall: IReportCardOverall;
  // The month the ratings are from
  conduct: {
    behaviour: string | null;
    uniformCleanliness: string | null;
    month: number | null;
    year: number | null;
  };
  position: IReportCardPosition | null;
  missingMarks: { testName: string; subjectName: string }[];
}
