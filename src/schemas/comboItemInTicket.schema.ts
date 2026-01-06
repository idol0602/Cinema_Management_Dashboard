import { z } from "zod";

export const createComboItemInTicketSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  combo_id: z.string().min(1, "Combo ID is required"),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboItemInTicketSchema = createComboItemInTicketSchema.partial();

export type CreateComboItemInTicketFormData = z.infer<typeof createComboItemInTicketSchema>;
export type UpdateComboItemInTicketFormData = z.infer<typeof updateComboItemInTicketSchema>;
