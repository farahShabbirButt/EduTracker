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
  month: number;
  year: number;
  totalMarks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class: ApiTestClassRef;
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

// POST /test body — subjects: min 1.
export type TestFormValues = {
  name: string;
  testType: TestType;
  month: number;
  year: number;
  totalMarks: number;
  classExternalId: string;
  subjects: TestSubjectInput[];
};

// PUT /test/:externalId body — same fields, all optional, saved in one transaction.
export type TestUpdateValues = Partial<TestFormValues>;
