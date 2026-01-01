import { z } from "zod";

export const slideSchema = z.object({
  image: z.string().min(1),
  trailer: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateSlideSchema = slideSchema.partial();

export type SlideFormData = z.infer<typeof slideSchema>;
export type UpdateSlideFormData = z.infer<typeof updateSlideSchema>;
