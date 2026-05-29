import { SubjectType, TestType } from '../@types/global.d';
import {
  type ITest,
  type ITestMarkEntry,
  type ITestSubjectConfig,
} from '../components/portal/MonthlyData/@types/testData.d';
import type { Student } from '../components/portal/Students/@types/student.d';
import type {
  GradeBoundary,
  Subject,
} from '../components/portal/Subjects/@types/subject.d';
export const ClassLevels = [
  'Nursery',
  'KG',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];
export const ResultSampleData = {
  studentInfo: {
    name: 'Qasim',
    fatherName: 'Amjad',
    class: '9th',
    rollNo: '615872',
  },
  tests: [
    {
      testName: 'Test 1',
      subjects: {
        Maths: 30,
        Urdu: 47,
        English: 54,
        AlQuran: 30,
        Islamic: 28,
        BioCom: 29,
        Physics: 28,
        Chemistry: 28,
      },
      total: 274,
      percentage: 94.48,
      grade: 'A+',
    },
    {
      testName: 'Test 2',
      subjects: {
        Maths: 22,
        Urdu: 47,
        English: 58,
        AlQuran: 30,
        Islamic: 27,
        BioCom: 27,
        Physics: 27,
        Chemistry: 22,
      },
      total: 263,
      percentage: 90.69,
      grade: 'A+',
    },
    {
      testName: 'Test 3',
      subjects: {
        Maths: 23,
        Urdu: 42,
        English: 54,
        AlQuran: 30,
        Islamic: 29,
        BioCom: 29,
        Physics: 26,
        Chemistry: 25,
      },
      total: 259,
      percentage: 89.31,
      grade: 'A+',
    },
    {
      testName: 'Test 4',
      subjects: {
        Maths: 29,
        Urdu: 47,
        English: 58,
        AlQuran: 30,
        Islamic: 24,
        BioCom: 27,
        Physics: 28,
        Chemistry: 30,
      },
      total: 273,
      percentage: 94.14,
      grade: 'A+',
    },
    {
      testName: 'Test 5',
      subjects: {
        Maths: 28,
        Urdu: 41,
        English: 57,
        AlQuran: 30,
        Islamic: 29,
        BioCom: 24,
        Physics: 27,
        Chemistry: 28,
      },
      total: 264,
      percentage: 91.03,
      grade: 'A+',
    },
    {
      testName: 'Test 6',
      subjects: {
        Maths: 26,
        Urdu: 36,
        English: 56,
        AlQuran: 29,
        Islamic: 26,
        BioCom: 26,
        Physics: 26,
        Chemistry: 30,
      },
      total: 253,
      percentage: 87.24,
      grade: 'A+',
    },
    {
      testName: 'Test 7',
      subjects: {
        Maths: 27,
        Urdu: 44,
        English: 54,
        AlQuran: 29,
        Islamic: 26,
        BioCom: 28,
        Physics: 28,
        Chemistry: 29,
      },
      total: 267,
      percentage: 92.07,
      grade: 'A+',
    },
    {
      testName: 'Test 8',
      subjects: {
        Maths: 26,
        Urdu: 40,
        English: 58,
        AlQuran: 30,
        Islamic: 26,
        BioCom: 22,
        Physics: 29,
        Chemistry: 0,
      },
      total: 230,
      percentage: 87.39,
      grade: 'A+',
    },
  ],
  behaviour: 'Excellent',
  uniformCleanliness: 'Excellent',
  overallResult: {
    obtainedMarks: 4108,
    totalMarks: 4520,
    percentage: 90.88,
    grade: 'A+',
    status: 'PASS',
    remarks:
      "Excellent Performance Overall. Don't Be Lazy. More Hardwork Makes You More Successful. In sha ALLAH",
  },
};

// ------ Fake seed data (you’ll replace with API later) ------
export const StudentsSampleData: Student[] = [
  {
    id: 's-001',
    firstName: 'Ayesha',
    lastName: 'Khan',
    fatherName: 'Imran Khan',
    rollNumber: 'ET-001',
    grade: '6',
    phone: '0300-1234567',
    email: '',
    subjectsAssigned: ['Math', 'Science'],
  },
  {
    id: 's-002',
    firstName: 'Ali',
    lastName: 'Raza',
    fatherName: 'Muhammad Raza',
    rollNumber: 'ET-002',
    grade: '7',
    phone: '0301-9876543',
    email: 'ali.raza@example.com',
    subjectsAssigned: [],
  },
];
const uid = () => Math.random().toString(36).slice(2);
export const SubjectsList: Subject[] = [
  {
    id: uid(),
    name: 'Math',
    defaultMaxMarks: 100,
    grades: ['9', '10'],
    subjectType: SubjectType.COMPULSORY,
  },
  {
    id: uid(),
    name: 'English',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.COMPULSORY,
  },
  {
    id: uid(),
    name: 'Urdu',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.COMPULSORY,
  },
  {
    id: uid(),
    name: 'Pak Studies',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.COMPULSORY,
  },
  {
    id: uid(),
    name: 'Computer',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.ELECTIVE,
  },
  {
    id: uid(),
    name: 'Biology',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.ELECTIVE,
  },
  {
    id: uid(),
    name: 'Maths',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.ELECTIVE,
  },
  {
    id: uid(),
    name: 'Islamiat',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.COMPULSORY,
  },
  {
    id: uid(),
    name: 'Physics',
    defaultMaxMarks: 100,
    grades: ['9'],
    subjectType: SubjectType.ELECTIVE,
  },
];
export const GradesList: GradeBoundary[] = [
  { label: 'A+', min: 90 },
  { label: 'A', min: 80 },
  { label: 'B+', min: 70 },
  { label: 'B', min: 60 },
  { label: 'C', min: 50 },
  { label: 'D', min: 40 },
  { label: 'F', min: 0 },
];

// test Data constants
export const MonthList = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const DummyTests: ITest[] = [
  {
    id: uid(),
    testName: 'Test 1',
    month: 2,
    year: 2025,
    classLevel: '9',
    createdAt: new Date().toISOString(),
    type: TestType.SESSION,
  },
];

export const DummyTestSubjectConfig: ITestSubjectConfig[] = [
  {
    testId: DummyTests[0].id,
    subjectId: 'math',
    maxMarks: 100,
  },
];

export const DummyTestMarks: ITestMarkEntry[] = [
  {
    id: uid(),
    testId: DummyTests[0].id,
    studentId: 's-001',
    subjectId: 'math',
    obtainedMarks: 54,
    maxMarks: 100,
  },
];
export const ClassLevelsList = [
  { id: 1, externalId: 'CLS-NUR', name: 'Nursery' },
  { id: 2, externalId: 'CLS-KG', name: 'KG' },
  { id: 3, externalId: 'CLS-1', name: '1' },
  { id: 4, externalId: 'CLS-2', name: '2' },
  { id: 5, externalId: 'CLS-3', name: '3' },
  { id: 6, externalId: 'CLS-4', name: '4' },
  { id: 7, externalId: 'CLS-5', name: '5' },
  { id: 8, externalId: 'CLS-6', name: '6' },
  { id: 9, externalId: 'CLS-7', name: '7' },
  { id: 10, externalId: 'CLS-8', name: '8' },
  { id: 11, externalId: 'CLS-9', name: '9' },
  { id: 12, externalId: 'CLS-10', name: '10' },
  { id: 13, externalId: 'CLS-11', name: '11' },
  { id: 14, externalId: 'CLS-12', name: '12' },
];

export const SampleReportCard = {
  studentInfo: {
    name: 'Qasim',
    fatherName: 'Amjad',
    class: '9th',
    rollNo: '615872',
  },
  tests: [
    {
      testName: 'Test 1',
      subjects: {
        Maths: 30,
        Urdu: 47,
        English: 54,
        AlQuran: 30,
        Islamic: 28,
        BioCom: 29,
        Physics: 28,
        Chemistry: 28,
      },
      total: 274,
      percentage: 94.48,
      grade: 'A+',
    },
    {
      testName: 'Test 2',
      subjects: {
        Maths: 22,
        Urdu: 47,
        English: 58,
        AlQuran: 30,
        Islamic: 27,
        BioCom: 27,
        Physics: 27,
        Chemistry: 22,
      },
      total: 263,
      percentage: 90.69,
      grade: 'A+',
    },
  ],
  behaviour: 'Excellent',
  uniformCleanliness: 'Excellent',
  overallResult: {
    obtainedMarks: 537,
    totalMarks: 600,
    percentage: 89.5,
    grade: 'A+',
    status: 'PASS',
    remarks: 'Great performance! Keep improving. In sha Allah.',
  },
};
