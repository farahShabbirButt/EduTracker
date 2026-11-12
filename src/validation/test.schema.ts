import { z } from 'zod';
import { TestType } from '../@types/global.d';

// Mirrors createTestValidation in edutracker-backend/src/modules/test/test.validation.ts —
// keep the two in step so the form never accepts what the API will reject.
// Every subject of the chosen class is a row; only `included` rows are sent, so
// max marks are checked on those rows alone.
const subjectRowSchema = z.object({
  subjectExternalId: z.string(),
  name: z.string(),
  included: z.boolean(),
  maxMarks: z.coerce.number<string | number>(),
});

export const testFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Test name is required')
      .max(50, 'Test name must be at most 50 characters'),
    // Checked below for the type picked: a monthly test needs its month and
    // year, a session test its date
    month: z.coerce.number<string | number>(),
    year: z.coerce.number<string | number>(),
    testDate: z.string(),
    classExternalId: z.string().min(1, 'Select a class'),
    testType: z.enum([TestType.MONTHLY, TestType.SESSION], {
      error: 'Select a test type',
    }),
    subjects: z.array(subjectRowSchema),
  })
  .superRefine((form, ctx) => {
    // Reports can't pick a later year, so its card could never print
    const lastYear = new Date().getFullYear() + 1;
    if (form.testType === TestType.SESSION) {
      const valid =
        /^\d{4}-\d{2}-\d{2}$/.test(form.testDate) &&
        !Number.isNaN(Date.parse(form.testDate));
      const year = Number(form.testDate.slice(0, 4));
      if (!valid) {
        ctx.addIssue({
          code: 'custom',
          path: ['testDate'],
          message: 'Pick the test date',
        });
      } else if (year < 2000 || year > lastYear) {
        ctx.addIssue({
          code: 'custom',
          path: ['testDate'],
          message: `Pick a date from 2000 to ${lastYear}`,
        });
      }
    } else {
      if (!Number.isInteger(form.month) || form.month < 1 || form.month > 12) {
        ctx.addIssue({
          code: 'custom',
          path: ['month'],
          message: 'Select a month',
        });
      }
      if (!Number.isInteger(form.year)) {
        ctx.addIssue({
          code: 'custom',
          path: ['year'],
          message: 'Enter a whole year',
        });
      } else if (form.year < 2000) {
        ctx.addIssue({
          code: 'custom',
          path: ['year'],
          message: 'Enter a year from 2000',
        });
      } else if (form.year > lastYear) {
        ctx.addIssue({
          code: 'custom',
          path: ['year'],
          message: "Year can't be past next year",
        });
      }
    }

    if (!form.classExternalId) return;
    if (!form.subjects.some((row) => row.included)) {
      ctx.addIssue({
        code: 'custom',
        path: ['subjects'],
        message: 'Include at least one subject',
      });
    }
    form.subjects.forEach((row, i) => {
      if (
        row.included &&
        (!Number.isInteger(row.maxMarks) ||
          row.maxMarks <= 0 ||
          row.maxMarks > 10000)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['subjects', i, 'maxMarks'],
          message: 'Must be a whole number above 0',
        });
      }
    });
  });

export type TestFormInput = z.input<typeof testFormSchema>;
export type TestFormOutput = z.output<typeof testFormSchema>;
export type TestSubjectRow = z.output<typeof subjectRowSchema>;
