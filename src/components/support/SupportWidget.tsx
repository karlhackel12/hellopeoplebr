
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithAnalytics } from '@/hooks/useAuthWithAnalytics';
import { useAuth } from '@/hooks/use-auth';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';

// Schema de validação do formulário
const supportFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome muito curto' }),
  email: z.string().email({ message: 'Email inválido' }),
  subject: z.string().min(3, { message: 'Assunto muito curto' }),
  message: z.string().min(10, { message: 'Mensagem muito curta' })
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Use the regular auth hook to get user data
  useAuthWithAnalytics(); // Keep for tracking but don't destructure
  const { trackEvent } = useAnalytics();
  
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: user?.user_metadata?.first_name ? `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name || ''}`.trim() : '',
      email: user?.email || '',
      subject: '',
      message: ''
    }
  });

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      trackEvent('support_widget_opened', {});
    }
  };

  const onSubmit = async (data: SupportFormValues) => {
    setIsSubmitting(true);
    
    try {
      trackEvent('support_form_submitted', { subject: data.subject });
      
      const response = await supabase.functions.invoke('send-support-email', {
        body: data
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar mensagem');
      }
      
      toast.success('Mensagem enviada!', {
        description: 'Nossa equipe responderá em breve.',
      });
      
      // Reset form
      form.reset({
        name: data.name,
        email: data.email,
        subject: '',
        message: ''
      });
      
      // Close widget after successful submission
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error submitting support form:', error);
      toast.error('Erro ao enviar mensagem', {
        description: 'Por favor, tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão flutuante */}
      <Button
        onClick={toggleWidget}
        variant={isOpen ? "outline" : "default"}
        size="icon"
        className={`h-14 w-14 rounded-full shadow-lg ${isOpen ? 'bg-white text-primary' : 'bg-primary'}`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

      {/* Formulário de suporte */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-[350px] md:w-[400px] shadow-xl p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Fale com o Suporte</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Qual assunto da sua mensagem?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Como podemos ajudar você?" 
                        className="resize-none min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
};
