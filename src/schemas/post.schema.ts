import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional(),
  user_id: z.string().min(1),
  created_at: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updatePostSchema = postSchema.partial();

export type PostFormData = z.infer<typeof postSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
