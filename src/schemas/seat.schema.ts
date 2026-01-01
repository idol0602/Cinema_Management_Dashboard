import { z } from "zod";

export const seatSchema = z.object({
  room_id: z.string().min(1, "Room is required"),
  seat_number: z.string().min(1, "Seat number is required"),
  type: z.enum(["VIP", "STANDARD"], {
    errorMap: () => ({ message: "Invalid seat type" }),
  }).optional(),
  is_active: z.boolean().optional(),
});

export const updateSeatSchema = seatSchema.partial();

export type SeatFormData = z.infer<typeof seatSchema>;
export type UpdateSeatFormData = z.infer<typeof updateSeatSchema>;
