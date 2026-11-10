import { useEffect, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import type { AppDispatch, RootState } from '../../../redux/store';
import {
  fetchInstitute,
  saveInstitute,
} from '../../../redux/slices/instituteSlice';
import { cardColors } from '../../../theme/tokens';
import FormTextField from '../../../common/Form/FormTextField';
import SettingsSection from '../../../common/SettingsSection';
import {
  instituteFormSchema,
  type InstituteFormInput,
  type InstituteFormOutput,
} from '../../../validation/institute.schema';

const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const LOGO_MAX_BYTES = 500 * 1024;
const LOGO_MAX_WIDTH = 400;
const LOGO_MAX_HEIGHT = 200;

// Every result card carries the logo, so it's kept far smaller than it prints sharp at.
// Throws if the file isn't really an image.
const shrinkLogo = async (file: File) => {
  const image = await createImageBitmap(file);
  const scale = Math.min(
    1,
    LOGO_MAX_WIDTH / image.width,
    LOGO_MAX_HEIGHT / image.height
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return canvas.toDataURL('image/webp');
};

const SchoolDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { institute, loading, error } = useSelector(
    (state: RootState) => state.institute
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<InstituteFormInput, unknown, InstituteFormOutput>({
    resolver: zodResolver(instituteFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      schoolYearStartDate: '',
      logo: null,
    },
  });

  const logo = watch('logo');
  const preview = watch();

  useEffect(() => {
    dispatch(fetchInstitute());
  }, [dispatch]);

  useEffect(() => {
    if (institute) {
      reset({
        name: institute.name,
        address: institute.address,
        phone: institute.phone,
        schoolYearStartDate: institute.schoolYearStartDate,
        logo: institute.logo,
      });
    }
  }, [institute, reset]);

  const handleLogoPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // So picking the same file again still fires
    event.target.value = '';
    if (!file) return;

    if (!LOGO_TYPES.includes(file.type)) {
      toast.error('Logo must be a PNG, JPG or WEBP image');
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error('Logo must be 500 KB or smaller');
      return;
    }

    try {
      setValue('logo', await shrinkLogo(file));
    } catch {
      toast.error('Could not read that image');
    }
  };

  const onSave = async (values: InstituteFormOutput) => {
    const result = await dispatch(saveInstitute(values));
    if (saveInstitute.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload as string);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No form: saving it blank would overwrite the school's details
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <form noValidate onSubmit={handleSubmit(onSave)}>
      <Stack spacing={2}>
        <SettingsSection
          title="School details"
          description="Printed on every result card. The start date sets the months on Reports."
        >
          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormTextField
              name="name"
              control={control}
              label="School Name"
              required
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormTextField
              name="address"
              control={control}
              label="Address"
              required
              fullWidth
            />
          </Box>
          <FormTextField
            name="phone"
            control={control}
            label="Phone"
            required
            fullWidth
            inputProps={{ inputMode: 'tel' }}
          />
          <FormTextField
            name="schoolYearStartDate"
            control={control}
            type="date"
            label="School Year Start Date"
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </SettingsSection>

        <SettingsSection
          title="School logo"
          description="PNG, JPG or WEBP, up to 500 KB. Printed beside the school name."
        >
          <Box
            sx={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {logo && (
              <Box
                component="img"
                src={logo}
                alt="School logo"
                sx={{ maxWidth: 96, maxHeight: 64, objectFit: 'contain' }}
              />
            )}
            <Button component="label" variant="outlined">
              {logo ? 'Change logo' : 'Upload logo'}
              <input
                hidden
                type="file"
                accept={LOGO_TYPES.join(',')}
                onChange={handleLogoPicked}
              />
            </Button>
            {logo && (
              <Button color="error" onClick={() => setValue('logo', null)}>
                Remove
              </Button>
            )}
          </Box>
        </SettingsSection>

        <SettingsSection
          title="Card preview"
          description="The top of every result card, as it will print."
          action={
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Save changes
            </Button>
          }
        >
          <Box
            sx={(theme) => ({
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.5,
              p: 2.5,
              textAlign: logo ? 'left' : 'center',
              bgcolor: cardColors.paper,
              color: cardColors.ink,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: `${theme.studio.radii.medium}px`,
            })}
          >
            {logo && (
              <Box
                component="img"
                src={logo}
                alt=""
                sx={{
                  flex: 'none',
                  maxWidth: 72,
                  maxHeight: 52,
                  objectFit: 'contain',
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={(theme) => ({
                  fontFamily: theme.studio.fonts.display,
                  fontWeight: 600,
                  fontSize: 18,
                  color: cardColors.accent,
                })}
              >
                {preview.name || 'Your school name'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'inherit', overflowWrap: 'anywhere' }}
              >
                {[preview.address, preview.phone].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          </Box>
        </SettingsSection>
      </Stack>
    </form>
  );
};

export default SchoolDetails;
