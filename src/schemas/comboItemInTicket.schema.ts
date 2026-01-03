import { z } from "zod";

export const createComboItemInTicketSchema = z.object({
  ticket_id: z.string().min(1, "Ticket ID is required"),
  combo_id: z.string().min(1, "Combo ID is required"),
});

export const updateComboItemInTicketSchema = createComboItemInTicketSchema.partial();

export type CreateComboItemInTicketFormData = z.infer<typeof createComboItemInTicketSchema>;
export type UpdateComboItemInTicketFormData = z.infer<typeof updateComboItemInTicketSchema>;
