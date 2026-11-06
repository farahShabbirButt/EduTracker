import { useEffect, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
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

  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid size={{ xs: 12, lg: 7 }}>
        <Card>
          <CardHeader
            title="School details"
            subheader="Printed on every result card. The school year start date sets the period on Reports."
          />
          <Divider />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              // No form: saving it blank would overwrite the school's details
              <Alert severity="error">{error}</Alert>
            ) : (
              <form noValidate onSubmit={handleSubmit(onSave)}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormTextField
                      name="name"
                      control={control}
                      label="School Name"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormTextField
                      name="address"
                      control={control}
                      label="Address"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="phone"
                      control={control}
                      label="Phone"
                      required
                      fullWidth
                      inputProps={{ inputMode: 'tel' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="schoolYearStartDate"
                      control={control}
                      type="date"
                      label="School Year Start Date"
                      required
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      School Logo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {logo && (
                        <Box
                          component="img"
                          src={logo}
                          alt="School logo"
                          sx={{
                            maxWidth: 80,
                            maxHeight: 56,
                            objectFit: 'contain',
                          }}
                        />
                      )}
                      <Button component="label" variant="outlined">
                        {logo ? 'Change Logo' : 'Upload Logo'}
                        <input
                          hidden
                          type="file"
                          accept={LOGO_TYPES.join(',')}
                          onChange={handleLogoPicked}
                        />
                      </Button>
                      {logo && (
                        <Button
                          color="error"
                          onClick={() => setValue('logo', null)}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      PNG, JPG or WEBP, up to 500 KB. Printed on every result
                      card.
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', mt: 2, justifyContent: 'end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    Save changes
                  </Button>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <Card>
          <CardHeader title="Card preview" />
          <Divider />
          <CardContent>
            <Box
              sx={(theme) => ({
                display: 'grid',
                gridTemplateColumns: '64px 1fr 64px',
                alignItems: 'center',
                gap: 1,
                p: 2,
                textAlign: 'center',
                bgcolor: cardColors.paper,
                color: cardColors.ink,
                borderRadius: `${theme.studio.radii.medium}px`,
                boxShadow: theme.studio.shadows.medium,
              })}
            >
              <Box>
                {logo && (
                  <Box
                    component="img"
                    src={logo}
                    alt=""
                    sx={{ maxWidth: 60, maxHeight: 44, objectFit: 'contain' }}
                  />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={(theme) => ({
                    fontFamily: theme.studio.fonts.display,
                    fontWeight: 600,
                    fontSize: 16,
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SchoolDetails;
