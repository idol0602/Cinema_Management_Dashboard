import { z } from "zod";

export const createShowTimeSchema = z.object({
  movie_id: z.string().min(1, "Movie ID is required"),
  room_id: z.string().min(1, "Room ID is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  day_type: z.enum(["WEEKDAY", "WEEKEND"]),
  is_active: z.boolean().default(true).optional(),
});

export const updateShowTimeSchema = createShowTimeSchema.partial();

export type CreateShowTimeFormData = z.infer<typeof createShowTimeSchema>;
export type UpdateShowTimeFormData = z.infer<typeof updateShowTimeSchema>;
