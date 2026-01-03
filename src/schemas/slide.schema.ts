import { z } from "zod";

export const createSlideSchema = z.object({
  image: z.string().min(1, "Image is required"),
  trailer: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateSlideSchema = createSlideSchema.partial();

export type CreateSlideFormData = z.infer<typeof createSlideSchema>;
export type UpdateSlideFormData = z.infer<typeof updateSlideSchema>;
