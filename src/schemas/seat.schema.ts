import { z } from "zod";

export const createSeatSchema = z.object({
  room_id: z.string().min(1, "Room ID is required"),
  seat_number: z.string().min(1, "Seat number is required"),
  type: z.enum(["VIP", "STANDARD"]).default("STANDARD").optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateSeatSchema = createSeatSchema.partial();

export type CreateSeatFormData = z.infer<typeof createSeatSchema>;
export type UpdateSeatFormData = z.infer<typeof updateSeatSchema>;
