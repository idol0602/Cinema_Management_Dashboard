import { z } from "zod";

export const discountSchema = z.object({
  event_id: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discount_percent: z.number().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
}).superRefine((data, ctx) => {
  if (data.valid_from && data.valid_to) {
    const from = new Date(data.valid_from);
    const to = new Date(data.valid_to);
    if (from >= to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'valid_from' must be earlier than 'valid_to'",
      });
    }
  }
});

export const updateDiscountSchema = discountSchema.partial();

export type DiscountFormData = z.infer<typeof discountSchema>;
export type UpdateDiscountFormData = z.infer<typeof updateDiscountSchema>;
