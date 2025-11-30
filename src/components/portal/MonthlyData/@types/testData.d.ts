// testData.d.ts

export interface ITest {
  id: string;
  testName: string;
  month: number; // 1–12
  year: number; // 2025, 2026…
  classLevel: string; // "9", "10"
  createdAt: string;
}

export interface ITestSubjectConfig {
  testId: string;
  subjectId: string;
  maxMarks: number; // user can override defaultMaxMarks
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
