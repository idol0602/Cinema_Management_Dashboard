import { z } from "zod";

export const createComboSchema = z.object({
  name: z.string().min(1, "Tên combo là bắt buộc"),
  description: z.string().optional(),
  total_price: z.number(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboSchema = createComboSchema.partial();

export type CreateComboFormData = z.infer<typeof createComboSchema>;
export type UpdateComboFormData = z.infer<typeof updateComboSchema>;
