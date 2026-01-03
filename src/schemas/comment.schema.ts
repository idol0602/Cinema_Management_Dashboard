import { z } from "zod";

export const createCommentSchema = z.object({
  movie_id: z.string().min(1, "Movie ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  content: z.string().min(1, "Content is required"),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateCommentSchema = createCommentSchema.partial();

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
