
import { z } from 'zod';

export const invitationSchema = z.object({
  invitationCode: z.string()
    .min(8, { message: 'Invitation code must be 8 characters' })
    .max(8, { message: 'Invitation code must be 8 characters' })
});

export type InvitationFormValues = z.infer<typeof invitationSchema>;
