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
import type { IReportCard } from '../components/portal/Reports/@types/reportCard.d';
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
// Reshaped to mirror the real `IReportCard` endpoint response (Task 13) — this
// is what powers the offline `/preview` route via ResultCardPreview. Test 8
// deliberately omits Al Quran and Islamiat from `marks` (not a substituted 0)
// to exercise the same blank-cell path as the school's real card.
export const ResultSampleData: IReportCard = {
  institute: {
    name: 'FARRUKH ACADEMY OF SCIENCE',
    address: 'Dhobi Ghat Stop Near Nafeerabad Graveyard Shalimar Town Lahore',
    phone: '+92 324 0012215',
  },
  student: {
    name: 'Qasim',
    fatherName: 'Amjad',
    class: '9th',
    rollNumber: '615872',
  },
  title: 'MONTHLY ASSESSMENT REPORT',
  subjects: [
    { externalId: 'maths', name: 'Maths' },
    { externalId: 'urdu', name: 'Urdu' },
    { externalId: 'english', name: 'English' },
    { externalId: 'al-quran', name: 'Al Quran' },
    { externalId: 'islamiat', name: 'Islamiat' },
    { externalId: 'bio-com', name: 'Bio/Computer' },
    { externalId: 'physics', name: 'Physics' },
    { externalId: 'chemistry', name: 'Chemistry' },
  ],
  rows: [
    {
      testName: 'Test 1',
      marks: {
        maths: { obtained: 30, max: 30 },
        urdu: { obtained: 48, max: 50 },
        english: { obtained: 54, max: 60 },
        'al-quran': { obtained: 30, max: 30 },
        islamiat: { obtained: 28, max: 30 },
        'bio-com': { obtained: 29, max: 30 },
        physics: { obtained: 28, max: 30 },
        chemistry: { obtained: 28, max: 30 },
      },
      total: 275,
      maxTotal: 290,
      percentage: 94.83,
      grade: 'A+',
    },
    {
      testName: 'Test 2',
      marks: {
        maths: { obtained: 22, max: 30 },
        urdu: { obtained: 47, max: 50 },
        english: { obtained: 58, max: 60 },
        'al-quran': { obtained: 30, max: 30 },
        islamiat: { obtained: 27, max: 30 },
        'bio-com': { obtained: 27, max: 30 },
        physics: { obtained: 27, max: 30 },
        chemistry: { obtained: 25, max: 30 },
      },
      total: 263,
      maxTotal: 290,
      percentage: 90.69,
      grade: 'A+',
    },
    {
      testName: 'Test 3',
      marks: {
        maths: { obtained: 23, max: 30 },
        urdu: { obtained: 42, max: 50 },
        english: { obtained: 54, max: 60 },
        'al-quran': { obtained: 30, max: 30 },
        islamiat: { obtained: 29, max: 30 },
        'bio-com': { obtained: 29, max: 30 },
        physics: { obtained: 26, max: 30 },
        chemistry: { obtained: 26, max: 30 },
      },
      total: 259,
      maxTotal: 290,
      percentage: 89.31,
      grade: 'A+',
    },
    {
      testName: 'Test 4',
      marks: {
        maths: { obtained: 29, max: 30 },
        urdu: { obtained: 47, max: 50 },
        english: { obtained: 58, max: 60 },
        'al-quran': { obtained: 30, max: 30 },
        islamiat: { obtained: 24, max: 30 },
        'bio-com': { obtained: 27, max: 30 },
        physics: { obtained: 28, max: 30 },
        chemistry: { obtained: 30, max: 30 },
      },
      total: 273,
      maxTotal: 290,
      percentage: 94.14,
      grade: 'A+',
    },
    {
      testName: 'Test 5',
      marks: {
        maths: { obtained: 28, max: 30 },
        urdu: { obtained: 41, max: 50 },
        english: { obtained: 57, max: 60 },
        'al-quran': { obtained: 30, max: 30 },
        islamiat: { obtained: 29, max: 30 },
        'bio-com': { obtained: 24, max: 30 },
        physics: { obtained: 27, max: 30 },
        chemistry: { obtained: 28, max: 30 },
      },
      total: 264,
      maxTotal: 290,
      percentage: 91.03,
      grade: 'A+',
    },
    {
      testName: 'Test 6',
      marks: {
        maths: { obtained: 26, max: 30 },
        urdu: { obtained: 36, max: 50 },
        english: { obtained: 56, max: 60 },
        'al-quran': { obtained: 29, max: 30 },
        islamiat: { obtained: 26, max: 30 },
        'bio-com': { obtained: 26, max: 30 },
        physics: { obtained: 26, max: 30 },
        chemistry: { obtained: 28, max: 30 },
      },
      total: 253,
      maxTotal: 290,
      percentage: 87.24,
      grade: 'A+',
    },
    {
      testName: 'Test 7',
      marks: {
        maths: { obtained: 27, max: 30 },
        urdu: { obtained: 44, max: 50 },
        english: { obtained: 54, max: 60 },
        'al-quran': { obtained: 29, max: 30 },
        islamiat: { obtained: 26, max: 30 },
        'bio-com': { obtained: 28, max: 30 },
        physics: { obtained: 28, max: 30 },
        chemistry: { obtained: 30, max: 30 },
      },
      total: 266,
      maxTotal: 290,
      percentage: 91.72,
      grade: 'A+',
    },
    {
      testName: 'Test 8',
      // Al Quran and Islamiat were not examined in this test — their keys are
      // omitted entirely (not zeroed) so the card renders blank cells.
      marks: {
        maths: { obtained: 26, max: 30 },
        urdu: { obtained: 40, max: 50 },
        english: { obtained: 58, max: 60 },
        'bio-com': { obtained: 22, max: 30 },
        physics: { obtained: 29, max: 30 },
        chemistry: { obtained: 26, max: 30 },
      },
      total: 201,
      maxTotal: 230,
      percentage: 87.39,
      grade: 'A+',
    },
  ],
  subjectTotals: {
    maths: { obtained: 211, max: 240 },
    urdu: { obtained: 345, max: 400 },
    english: { obtained: 449, max: 480 },
    'al-quran': { obtained: 208, max: 210 },
    islamiat: { obtained: 189, max: 210 },
    'bio-com': { obtained: 212, max: 240 },
    physics: { obtained: 219, max: 240 },
    chemistry: { obtained: 221, max: 240 },
  },
  overall: {
    obtainedMarks: 2054,
    totalMarks: 2260,
    percentage: 90.88,
    grade: 'A+',
    status: 'PASS',
    remarks:
      "Excellent Performance Overall. Don't Be Lazy. More Hardwork Makes You More Successful. In sha ALLAH",
  },
  conduct: {
    behaviour: 'Excellent',
    uniformCleanliness: 'Excellent',
  },
  position: { rank: 2, outOf: 35 },
};

// ------ Fake seed data (replaced per-screen as each integration wave lands) ------
export const StudentsSampleData: Student[] = [
  {
    id: 1,
    externalId: '11111111-1111-4111-8111-111111111111',
    firstName: 'Ayesha',
    lastName: 'Khan',
    fatherName: 'Imran Khan',
    rollNumber: 'ET-001',
    contactNo: '0300-1234567',
    email: '',
    classId: 6,
    class: {
      name: 'Class 6',
      externalId: '66666666-6666-4666-8666-666666666666',
    },
    subjects: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    externalId: '22222222-2222-4222-8222-222222222222',
    firstName: 'Ali',
    lastName: 'Raza',
    fatherName: 'Muhammad Raza',
    rollNumber: 'ET-002',
    contactNo: '0301-9876543',
    email: 'ali.raza@example.com',
    classId: 7,
    class: {
      name: 'Class 7',
      externalId: '77777777-7777-4777-8777-777777777777',
    },
    subjects: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
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
