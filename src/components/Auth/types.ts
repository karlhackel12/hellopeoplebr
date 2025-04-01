
import { z } from 'zod';

// Base schema for all auth forms
const baseSchema = {
  email: z.string().email({ message: 'E-mail inválido' }),
};

// Login form schema
export const loginSchema = z.object({
  ...baseSchema,
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});

// Registration form schema
export const registerSchema = z.object({
  ...baseSchema,
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  role: z.enum(['student', 'teacher']),
  invitationCode: z.string().optional(),
  referralCode: z.string().optional(),
  planId: z.string().optional(),
});

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  ...baseSchema,
});

// Types based on schemas
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Union type for all form values
export type FormValues = LoginFormValues | RegisterFormValues | ForgotPasswordFormValues;

// Invitation data type
export interface InvitationData {
  email: string | null;
  code: string | null;
  isInvited: boolean;
}
