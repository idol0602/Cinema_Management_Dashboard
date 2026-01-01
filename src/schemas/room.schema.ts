import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  format: z.enum(["2D", "3D", "IMAX"], {
    errorMap: () => ({ message: "Invalid format" }),
  }),
  location: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const updateRoomSchema = roomSchema.partial();

export type RoomFormData = z.infer<typeof roomSchema>;
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;
