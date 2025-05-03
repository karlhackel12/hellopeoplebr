import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { InvitationFormValues } from './types';

interface InvitationVerificationFormProps {
  form: UseFormReturn<InvitationFormValues>;
  onSubmit: (values: InvitationFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const InvitationVerificationForm: React.FC<InvitationVerificationFormProps> = ({
  form,
  onSubmit,
  isLoading,
  error
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invitationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Convite</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Digite o código de 8 caracteres" 
                  className="uppercase"
                  disabled={isLoading}
                  maxLength={8}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    e.target.value = value;
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 flex items-start">
            <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Convite'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default InvitationVerificationForm;
