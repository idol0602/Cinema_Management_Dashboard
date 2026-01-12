import { z } from "zod";

export const createMenuItemInTicketSchema = z.object({
  order_id: z.string().min(1, "ID đơn hàng là bắt buộc"),
  item_id: z.string().min(1, "ID mặt hàng là bắt buộc"),
  quantity: z.number().int().min(1, "Số lượng phải ít nhất là 1"),
  unit_price: z.number().gt(0, "Giá đơn vị phải lớn hơn 0"),
  total_price: z.number().optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMenuItemInTicketSchema = createMenuItemInTicketSchema.partial();

export type CreateMenuItemInTicketFormData = z.infer<typeof createMenuItemInTicketSchema>;
export type UpdateMenuItemInTicketFormData = z.infer<typeof updateMenuItemInTicketSchema>;
