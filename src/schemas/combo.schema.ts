import { z } from "zod";

export const comboSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  total_price: z.number(),
  is_active: z.boolean().default(true).optional(),
});

export const updateComboSchema = comboSchema.partial();

export type ComboFormData = z.infer<typeof comboSchema>;
export type UpdateComboFormData = z.infer<typeof updateComboSchema>;
