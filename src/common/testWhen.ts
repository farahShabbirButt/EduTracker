import { MonthList } from '../config/constants';

type TestTime = {
  testType: string;
  month: number;
  year: number;
  testDate?: string | null;
};

const monthName = (month: number) =>
  MonthList.find((m) => m.value === month)?.label ?? String(month);

// "12 Feb 2027" from YYYY-MM-DD, read as written so no time zone shifts the day
export const dayLabel = (isoDay: string) => {
  const [year, month, day] = isoDay.split('-').map(Number);
  return `${day} ${monthName(month).slice(0, 3)} ${year}`;
};

// When a test was sat: its day for a session test, its month for a monthly one
export const testWhen = (test: TestTime) =>
  test.testType === 'SESSION' && test.testDate
    ? dayLabel(test.testDate)
    : `${monthName(test.month)} ${test.year}`;
