import { z } from "zod";

export const showTimeSchema = z.object({
  movie_id: z.string().min(1),
  room_id: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().optional(),
  day_type: z.enum(["WEEKDAY", "WEEKEND"]),
  is_active: z.boolean().default(true).optional(),
});

export const updateShowTimeSchema = showTimeSchema.partial();

export type ShowTimeFormData = z.infer<typeof showTimeSchema>;
export type UpdateShowTimeFormData = z.infer<typeof updateShowTimeSchema>;
