import { z } from "zod";

const eventBaseSchema = z.object({
  name: z.string().min(1, "Tên sự kiện là bắt buộc").optional(),
  description: z.string().optional(),
  start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  end_date: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  image: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().optional(),
});

const withDateRangeRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data: Record<string, unknown>, ctx) => {
    if (data?.start_date && data?.end_date) {
      const from = new Date(String(data.start_date));
      const to = new Date(String(data.end_date));

      if (from >= to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày bắt đầu phải sớm hơn ngày kết thúc",
          path: ["end_date"],
        });
      }
    }
  });

export const createEventSchema = withDateRangeRefine(eventBaseSchema);
export const updateEventSchema = withDateRangeRefine(eventBaseSchema.partial());

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
