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
