import { z } from 'zod';

// Mirrors saveInstituteValidation in
// edutracker-backend/src/modules/institute/institute.validation.ts — keep the two in step.
export const instituteFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'School name is required')
    .max(100, 'School name must be at most 100 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(200, 'Address must be at most 200 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .max(30, 'Phone must be at most 30 characters'),
  schoolYearStartMonth: z.coerce
    .number<string | number>()
    .int()
    .min(1, 'Select a month')
    .max(12, 'Select a month'),
});

export type InstituteFormInput = z.input<typeof instituteFormSchema>;
export type InstituteFormOutput = z.output<typeof instituteFormSchema>;
