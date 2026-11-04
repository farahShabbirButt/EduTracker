import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error'
> & {
  name: FieldPath<T>;
  control: Control<T, any, any>;
};

// MUI TextField (incl. `select`) bound to a react-hook-form field. Shows the
// field's validation message under it, falling back to any helperText passed in.
export default function FormTextField<T extends FieldValues>({
  name,
  control,
  helperText,
  ...textFieldProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, ...field }, fieldState }) => (
        <TextField
          {...textFieldProps}
          {...field}
          value={value ?? ''}
          // inputRef (not ref) so RHF can focus the first invalid field on submit
          inputRef={ref}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}
