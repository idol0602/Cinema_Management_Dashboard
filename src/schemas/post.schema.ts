import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
  user_id: z.string().min(1, "User ID is required"),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
