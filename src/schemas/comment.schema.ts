import { z } from "zod";

export const commentSchema = z.object({
  movie_id: z.string().min(1),
  user_id: z.string().min(1),
  content: z.string().min(1),
  created_at: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateCommentSchema = commentSchema.partial();

export type CommentFormData = z.infer<typeof commentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
