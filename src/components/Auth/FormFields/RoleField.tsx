
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../types';

type RoleFieldProps = {
  form: UseFormReturn<RegisterFormValues>;
};

const RoleField: React.FC<RoleFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>I am a</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <FormLabel htmlFor="student" className="cursor-pointer">Student</FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <FormLabel htmlFor="teacher" className="cursor-pointer">Teacher</FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RoleField;
