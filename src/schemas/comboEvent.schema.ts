import { z } from "zod";

export const createComboEventSchema = z.object({
  combo_id: z.string().min(1, "Combo ID is required"),
  event_id: z.string().min(1, "Event ID is required"),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboEventSchema = createComboEventSchema.partial();

export type CreateComboEventFormData = z.infer<typeof createComboEventSchema>;
export type UpdateComboEventFormData = z.infer<typeof updateComboEventSchema>;
