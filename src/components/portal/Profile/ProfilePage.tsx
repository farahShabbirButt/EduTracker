import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import { changePassword, updateProfile } from '../../../redux/slices/authSlice';
import FormTextField from '../../../common/Form/FormTextField';
import SettingsSection from '../../../common/SettingsSection';
import {
  passwordFormSchema,
  profileFormSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from '../../../validation/profile.schema';

const EMPTY_PASSWORDS: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const details = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      currentPassword: '',
    },
  });

  const password = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: EMPTY_PASSWORDS,
  });

  const emailChanging =
    details.watch('email').trim().toLowerCase() !== user?.email;

  const saveDetails = async (values: ProfileFormValues) => {
    const result = await dispatch(
      updateProfile({
        name: values.name,
        email: values.email,
        ...(emailChanging && { currentPassword: values.currentPassword }),
      })
    );
    if (updateProfile.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload as string);
    }
  };

  const savePassword = async (values: PasswordFormValues) => {
    const result = await dispatch(
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    );
    if (changePassword.fulfilled.match(result)) {
      toast.success(result.payload);
      password.reset(EMPTY_PASSWORDS);
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <Stack spacing={2}>
      <SettingsSection
        title="Your details"
        description="You sign in with this email, and password reset links go to it."
        action={
          <Button
            type="submit"
            variant="contained"
            disabled={details.formState.isSubmitting}
          >
            Save details
          </Button>
        }
        onSubmit={details.handleSubmit(saveDetails)}
      >
        <FormTextField
          name="name"
          control={details.control}
          label="Name"
          required
          fullWidth
        />
        <FormTextField
          name="email"
          control={details.control}
          label="Email"
          type="email"
          required
          fullWidth
        />
        {emailChanging && (
          <FormTextField
            name="currentPassword"
            control={details.control}
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            helperText="Needed to change your email"
          />
        )}
      </SettingsSection>

      <SettingsSection
        title="Change password"
        description="Enter your current password, then the new one twice."
        action={
          <Button
            type="submit"
            variant="contained"
            disabled={password.formState.isSubmitting}
          >
            Change password
          </Button>
        }
        onSubmit={password.handleSubmit(savePassword)}
      >
        <FormTextField
          name="currentPassword"
          control={password.control}
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          fullWidth
        />
        <Box sx={{ gridColumnStart: 1 }}>
          <FormTextField
            name="newPassword"
            control={password.control}
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            fullWidth
            helperText="At least 8 characters"
          />
        </Box>
        <FormTextField
          name="confirmPassword"
          control={password.control}
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          fullWidth
        />
      </SettingsSection>
    </Stack>
  );
}
