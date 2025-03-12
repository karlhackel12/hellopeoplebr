
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../types';

type NameFieldProps = {
  form: UseFormReturn<RegisterFormValues>;
  isLoading: boolean;
};

const NameField: React.FC<NameFieldProps> = ({ form, isLoading }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="Enter your name"
              disabled={isLoading}
              className="h-11"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NameField;
