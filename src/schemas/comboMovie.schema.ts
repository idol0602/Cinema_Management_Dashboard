import { z } from "zod";

export const createComboMovieSchema = z.object({
  combo_id: z.string().min(1, "Combo ID is required"),
  movie_id: z.string().min(1, "Movie ID is required"),
});

export const updateComboMovieSchema = createComboMovieSchema.partial();

export type CreateComboMovieFormData = z.infer<typeof createComboMovieSchema>;
export type UpdateComboMovieFormData = z.infer<typeof updateComboMovieSchema>;
