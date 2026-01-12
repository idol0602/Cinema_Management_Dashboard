import { z } from "zod";

export const createRateSchema = z.object({
  movie_id: z.string().min(1, "ID phim là bắt buộc"),
  user_id: z.string().min(1, "ID người dùng là bắt buộc"),
  stars: z.number().min(1).max(10),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
});

export const updateRateSchema = createRateSchema.partial();

export type CreateRateFormData = z.infer<typeof createRateSchema>;
export type UpdateRateFormData = z.infer<typeof updateRateSchema>;
