import { z } from "zod";

export const createTicketPriceSchema = z.object({
  format: z.enum(["2D", "3D", "IMAX"]),
  seat_type: z.enum(["VIP", "STANDARD"]),
  day_type: z.enum(["WEEKDAY", "WEEKEND"]),
  price: z.number(),
});

export const updateTicketPriceSchema = createTicketPriceSchema.partial();

export type CreateTicketPriceFormData = z.infer<typeof createTicketPriceSchema>;
export type UpdateTicketPriceFormData = z.infer<typeof updateTicketPriceSchema>;
