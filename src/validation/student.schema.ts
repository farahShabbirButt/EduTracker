import { z } from 'zod';

// Mirrors createStudentValidation / updateStudentValidation in
// edutracker-backend/src/modules/student/student.validation.ts — keep the two in step.
// Optional fields stay '' in the form; toStudentPayload drops them before sending,
// because the API rejects '' for contactNo (min 7) and, on edit, for email.
export const studentFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .trim()
    .max(50, 'Last name must be at most 50 characters'),
  fatherName: z
    .string()
    .trim()
    .min(1, 'Father name is required')
    .max(50, 'Father name must be at most 50 characters'),
  rollNumber: z
    .string()
    .trim()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number must be at most 20 characters'),
  classId: z.string().min(1, 'Select a class'),
  contactNo: z
    .string()
    .trim()
    .refine((v) => v === '' || (v.length >= 7 && v.length <= 20), {
      message: 'Contact number must be 7–20 characters',
    }),
  email: z
    .string()
    .trim()
    .pipe(z.union([z.literal(''), z.email('Enter a valid email address')])),
  electiveSubjectIds: z.array(z.string()),
});

export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormOutput = z.output<typeof studentFormSchema>;

// Blank optional contact fields are left out rather than sent as ''. (Clearing a
// previously saved contact/email isn't supported by the API yet.)
export const toStudentPayload = ({
  contactNo,
  email,
  ...rest
}: StudentFormOutput) => ({
  ...rest,
  ...(contactNo && { contactNo }),
  ...(email && { email }),
});
