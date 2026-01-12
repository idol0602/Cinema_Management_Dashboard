import { z } from "zod";

export const createComboEventSchema = z.object({
  combo_id: z.string().min(1, "ID combo là bắt buộc"),
  event_id: z.string().min(1, "ID sự kiện là bắt buộc"),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboEventSchema = createComboEventSchema.partial();

export type CreateComboEventFormData = z.infer<typeof createComboEventSchema>;
export type UpdateComboEventFormData = z.infer<typeof updateComboEventSchema>;
