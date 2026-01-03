import { z } from "zod";

export const createMovieTypeSchema = z.object({
  type: z.string().min(1, "Type is required"),
});

export const updateMovieTypeSchema = createMovieTypeSchema.partial();

export type CreateMovieTypeFormData = z.infer<typeof createMovieTypeSchema>;
export type UpdateMovieTypeFormData = z.infer<typeof updateMovieTypeSchema>;
