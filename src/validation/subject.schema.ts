import { z } from 'zod';
import { SubjectType } from '../@types/global.d';

// Mirrors createSubjectValidation in edutracker-backend/src/modules/subject/subject.validation.ts —
// keep the two in step so the form never accepts what the API will reject.
export const subjectFormSchema = z.object({
  name: z.string().trim().min(2, 'Subject name must be at least 2 characters'),
  subjectType: z.enum([SubjectType.COMPULSORY, SubjectType.ELECTIVE], {
    error: 'Select a subject type',
  }),
  // Number inputs hand back strings, so coerce before checking
  maxMarks: z.coerce
    .number<string | number>({ error: 'Enter max marks' })
    .int('Max marks must be a whole number')
    .positive('Max marks must be greater than 0')
    .max(10000, "Max marks can't be above 10000"),
});

export type SubjectFormInput = z.input<typeof subjectFormSchema>;
export type SubjectFormOutput = z.output<typeof subjectFormSchema>;
