import { z } from "zod";

export const createComboMovieSchema = z.object({
  combo_id: z.string().min(1, "ID combo là bắt buộc"),
  movie_id: z.string().min(1, "ID phim là bắt buộc"),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboMovieSchema = createComboMovieSchema.partial();

export type CreateComboMovieFormData = z.infer<typeof createComboMovieSchema>;
export type UpdateComboMovieFormData = z.infer<typeof updateComboMovieSchema>;
