
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../types';

type EmailFieldProps = {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
  isDisabled?: boolean;
};

const EmailField: React.FC<EmailFieldProps> = ({ form, isLoading, isDisabled = false }) => {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>E-mail</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="email"
              placeholder="Digite seu e-mail"
              disabled={isLoading || isDisabled}
              className="h-11"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailField;
