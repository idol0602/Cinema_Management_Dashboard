import { z } from "zod";

export const rateSchema = z.object({
  movie_id: z.string().min(1),
  user_id: z.string().min(1),
  stars: z.number().min(1).max(5),
  created_at: z.string().optional(),
});

export const updateRateSchema = rateSchema.partial();

export type RateFormData = z.infer<typeof rateSchema>;
export type UpdateRateFormData = z.infer<typeof updateRateSchema>;
