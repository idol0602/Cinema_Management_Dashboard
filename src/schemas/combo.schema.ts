import { z } from "zod";

export const createComboSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  total_price: z.number(),
  is_active: z.boolean().default(true).optional(),
});

export const updateComboSchema = createComboSchema.partial();

export type CreateComboFormData = z.infer<typeof createComboSchema>;
export type UpdateComboFormData = z.infer<typeof updateComboSchema>;
