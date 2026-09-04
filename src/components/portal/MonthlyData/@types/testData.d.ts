import type { TestType } from '../../../../@types/global';

export interface ITest {
  id: string;
  testName: string;
  month: number;
  year: number;
  type: TestType;
  classLevel: string;
  createdAt: string;
}

export interface ITestSubjectConfig {
  testId: string;
  subjectId: string;
  maxMarks: number;
}

export interface ITestMarkEntry {
  id: string;
  testId: string;
  studentId: string;
  subjectId: string;
  obtainedMarks: number;
  maxMarks: number;
}

export interface ITestWithRelations {
  test: ITest;
  subjectConfigs: ITestSubjectConfig[];
  marks: ITestMarkEntry[];
}

// Real `/test` API shape (see edutracker-backend TestService). `totalMarks` is
// recomputed server-side from the test's subjects — treat it as a display value,
// never as something the client derives authority from.
export type ApiTestClassRef = {
  externalId: string;
  name: string;
};

export type ApiTest = {
  id: number;
  externalId: string;
  name: string;
  testType: TestType;
  month: number;
  year: number;
  totalMarks: number;
  classId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
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

// PUT /test/:externalId body — same fields, all optional, NO subjects key.
export type TestUpdateValues = Partial<Omit<TestFormValues, 'subjects'>>;
