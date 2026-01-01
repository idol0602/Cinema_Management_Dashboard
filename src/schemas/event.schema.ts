import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  image: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateEventSchema = eventSchema.partial();

export type EventFormData = z.infer<typeof eventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
