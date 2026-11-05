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
    month: z.coerce
      .number<string | number>()
      .int()
      .min(1, 'Select a month')
      .max(12, 'Select a month'),
    year: z.coerce
      .number<string | number>({ error: 'Enter a year' })
      .int('Enter a whole year')
      .min(2000, 'Enter a year from 2000')
      // Reports can't pick a later year, so its card could never print
      .max(new Date().getFullYear() + 1, "Year can't be past next year"),
    classExternalId: z.string().min(1, 'Select a class'),
    testType: z.enum([TestType.MONTHLY, TestType.SESSION], {
      error: 'Select a test type',
    }),
    subjects: z.array(subjectRowSchema),
  })
  .superRefine((form, ctx) => {
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
