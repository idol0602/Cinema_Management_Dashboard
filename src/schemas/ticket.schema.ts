import { z } from "zod";

export const createTicketSchema = z.object({
  ticket_price_id: z.string().min(1, "ID giá vé là bắt buộc"),
  order_id: z.string().min(1, "ID đơn hàng là bắt buộc"),
  showtime_seat_id: z.string().min(1, "ID ghế suất chiếu là bắt buộc"),
});

export const updateTicketSchema = createTicketSchema.partial();
