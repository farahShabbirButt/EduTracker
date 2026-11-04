import { z } from 'zod';

// Mirrors createClassValidation in edutracker-backend/src/modules/class/class.validation.ts —
// keep the two in step so the form never accepts what the API will reject.
export const classFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be less than 100 characters'),
});

export type ClassFormInput = z.input<typeof classFormSchema>;
export type ClassFormOutput = z.output<typeof classFormSchema>;
