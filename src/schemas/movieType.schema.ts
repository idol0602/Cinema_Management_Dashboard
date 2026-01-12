import { z } from "zod";

export const createMovieTypeSchema = z.object({
  type: z.string().min(1, "Loại phim là bắt buộc"),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMovieTypeSchema = createMovieTypeSchema.partial();

export type CreateMovieTypeFormData = z.infer<typeof createMovieTypeSchema>;
export type UpdateMovieTypeFormData = z.infer<typeof updateMovieTypeSchema>;
