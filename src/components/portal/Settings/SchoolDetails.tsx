import { useEffect } from 'react';
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
  MenuItem,
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
import FormTextField from '../../../common/Form/FormTextField';
import { MonthList } from '../../../config/constants';
import {
  instituteFormSchema,
  type InstituteFormInput,
  type InstituteFormOutput,
} from '../../../validation/institute.schema';

const SchoolDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { institute, loading, error } = useSelector(
    (state: RootState) => state.institute
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InstituteFormInput, unknown, InstituteFormOutput>({
    resolver: zodResolver(instituteFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      schoolYearStartMonth: 1,
    },
  });

  useEffect(() => {
    dispatch(fetchInstitute());
  }, [dispatch]);

  useEffect(() => {
    if (institute) {
      reset({
        name: institute.name,
        address: institute.address,
        phone: institute.phone,
        schoolYearStartMonth: institute.schoolYearStartMonth,
      });
    }
  }, [institute, reset]);

  const onSave = async (values: InstituteFormOutput) => {
    const result = await dispatch(saveInstitute(values));
    if (saveInstitute.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <Card>
      <CardHeader
        title="School Details"
        subheader="Printed on every result card. The school year sets the period on Reports."
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
                  name="schoolYearStartMonth"
                  control={control}
                  select
                  label="School Year Starts In"
                  required
                  fullWidth
                >
                  {MonthList.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </FormTextField>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', mt: 2, justifyContent: 'end' }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Save
              </Button>
            </Box>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolDetails;
