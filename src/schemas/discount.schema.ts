import { z } from "zod";

const discountBaseSchema = z.object({
  event_id: z.string().optional(),
  name: z.string().min(1, "Tên giảm giá là bắt buộc").optional(),
  description: z.string().optional(),
  discount_percent: z.number().optional(),
  valid_from: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  valid_to: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
});

// 👇 QUAN TRỌNG: dùng ZodTypeAny
const withDateRangeRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data: Record<string, unknown>, ctx) => {
    if (data?.valid_from && data?.valid_to) {
      const from = new Date(String(data.valid_from));
      const to = new Date(String(data.valid_to));

      if (from >= to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày bắt đầu phải sớm hơn ngày kết thúc",
          path: ["valid_to"],
        });
      }
    }
  });

export const createDiscountSchema =
  withDateRangeRefine(discountBaseSchema);

export const updateDiscountSchema =
  withDateRangeRefine(discountBaseSchema.partial());

export type CreateDiscountFormData =
  z.infer<typeof createDiscountSchema>;

export type UpdateDiscountFormData =
  z.infer<typeof updateDiscountSchema>;
