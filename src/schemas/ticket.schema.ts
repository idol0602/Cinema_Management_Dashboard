import { z } from "zod";

export const createTicketSchema = z.object({
  ticket_price_id: z.string(),
  order_id: z.string(),
  showtime_seat_id: z.string(),
});

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
