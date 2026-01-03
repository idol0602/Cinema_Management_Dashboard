import { z } from "zod";

export const createMenuItemInTicketSchema = z.object({
  ticket_id: z.string().min(1, "Ticket ID is required"),
  item_id: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.number().gt(0, "Unit price must be greater than 0"),
  total_price: z.number().optional(),
});

export const updateMenuItemInTicketSchema = createMenuItemInTicketSchema.partial();

export type CreateMenuItemInTicketFormData = z.infer<typeof createMenuItemInTicketSchema>;
export type UpdateMenuItemInTicketFormData = z.infer<typeof updateMenuItemInTicketSchema>;
