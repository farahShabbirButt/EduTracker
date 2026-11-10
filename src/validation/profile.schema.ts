import { z } from 'zod';

// Mirrors updateProfileValidation and changePasswordValidation in
// edutracker-backend/src/modules/auth/auth.validation.ts — keep them in step.
export const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  currentPassword: z.string().optional(),
});

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .refine(
        (v) => new TextEncoder().encode(v).length <= 72,
        'Use at most 72 characters'
      ),
    confirmPassword: z.string().min(1, 'Enter the new password again'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "The passwords don't match",
    path: ['confirmPassword'],
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
