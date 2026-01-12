import { z } from "zod";

export const createShowTimeSeatSchema = z.object({
  show_time_id: z.string().min(1, "ID suất chiếu là bắt buộc"),
  seat_id: z.string().min(1, "ID ghế là bắt buộc"),
  status_seat: z.enum(["AVAILABLE", "HOLDING", "BOOKED", "FIXING"]).default("AVAILABLE").optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateShowTimeSeatSchema = createShowTimeSeatSchema.partial();

export type CreateShowTimeSeatFormData = z.infer<typeof createShowTimeSeatSchema>;
export type UpdateShowTimeSeatFormData = z.infer<typeof updateShowTimeSeatSchema>;
