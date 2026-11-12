import type { TestType } from '../../../../@types/global';

// Real `/test` API shape (see edutracker-backend TestService). `totalMarks` is
// recomputed server-side from the test's subjects — treat it as a display value,
// never as something the client derives authority from.
export type ApiTestClassRef = {
  externalId: string;
  name: string;
};

export type ApiTest = {
  externalId: string;
  name: string;
  testType: TestType;
  // A session test's are taken from its date
  month: number;
  year: number;
  // YYYY-MM-DD, session tests only
  testDate: string | null;
  totalMarks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class: ApiTestClassRef;
  marksEntered: number;
  marksExpected: number;
};

// Real `GET /test/:externalId/subjects` row shape.
export type ApiTestSubject = {
  externalId: string;
  subject: {
    externalId: string;
    name: string;
  };
  maxMarks: number;
};

export type TestSubjectInput = {
  subjectExternalId: string;
  maxMarks: number;
};

// POST /test body — subjects: min 1. A monthly test sends month and year, a
// session test its date.
export type TestFormValues = {
  name: string;
  testType: TestType;
  month?: number;
  year?: number;
  testDate?: string;
  totalMarks: number;
  classExternalId: string;
  subjects: TestSubjectInput[];
};

// PUT /test/:externalId body — same fields, all optional, saved in one transaction.
export type TestUpdateValues = Partial<TestFormValues>;
