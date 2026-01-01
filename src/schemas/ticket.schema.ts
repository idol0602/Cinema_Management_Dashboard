import { z } from "zod";

export const ticketSchema = z.object({
  user_id: z.string().min(1),
  showtime_seat_id: z.string().min(1),
  discount_id: z.string().optional(),
  ticket_price_id: z.string().optional(),
  ticket_vat: z.number().default(10).optional(),
  service_vat: z.number().default(10).optional(),
  total_price: z.number(),
  purchased_at: z.string().optional(),
});

export const updateTicketSchema = ticketSchema.partial();

export type TicketFormData = z.infer<typeof ticketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
