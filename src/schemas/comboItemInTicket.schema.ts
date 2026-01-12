import { z } from "zod";

export const createComboItemInTicketSchema = z.object({
  order_id: z.string().min(1, "ID đơn hàng là bắt buộc"),
  combo_id: z.string().min(1, "ID combo là bắt buộc"),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboItemInTicketSchema = createComboItemInTicketSchema.partial();

export type CreateComboItemInTicketFormData = z.infer<typeof createComboItemInTicketSchema>;
export type UpdateComboItemInTicketFormData = z.infer<typeof updateComboItemInTicketSchema>;
