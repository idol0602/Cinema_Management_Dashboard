import type { RoomFormat } from './room.types';
import type { SeatType } from './seat.types';
import type { DayType } from './showTime.types';

export interface TicketPrice {
  id: string;
  format: RoomFormat;
  seat_type: SeatType;
  day_type: DayType;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTicketPriceDTO {
  format: RoomFormat;
  seat_type: SeatType;
  day_type: DayType;
  price: number;
}

export interface UpdateTicketPriceDTO {
  format?: RoomFormat;
  seat_type?: SeatType;
  day_type?: DayType;
  price?: number;
}

export interface TicketPriceResponse {
  data: TicketPrice[];
  error?: string;
}

export interface TicketPriceDetailResponse {
  data: TicketPrice;
  error?: string;
}
