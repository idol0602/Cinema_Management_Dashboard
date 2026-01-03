import { z } from "zod";

export const createTicketSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  showtime_seat_id: z.string().min(1, "Showtime seat ID is required"),
  discount_id: z.string().optional(),
  ticket_price_id: z.string().optional(),
  ticket_vat: z.number().default(10).optional(),
  service_vat: z.number().default(10).optional(),
  total_price: z.number(),
  purchased_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
});

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
