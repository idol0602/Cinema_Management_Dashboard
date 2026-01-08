export type TicketFormat = "2D" | "3D" | "IMAX";
export type SeatType = "VIP" | "STANDARD";
export type DayType = "WEEKDAY" | "WEEKEND";

export interface TicketPriceType {
  id?: string;
  format: TicketFormat;
  seat_type: SeatType;
  day_type: DayType;
  price: number;
  created_at?: string;
}

export interface CreateTicketPriceType {
  format: TicketFormat;
  seat_type: SeatType;
  day_type: DayType;
  price: number;
  created_at?: string;
}

export interface UpdateTicketPriceType {
  format?: TicketFormat;
  seat_type?: SeatType;
  day_type?: DayType;
  price?: number;
  created_at?: string;
}