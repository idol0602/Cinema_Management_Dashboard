export type SeatType = 'VIP' | 'STANDARD';

export interface Seat {
  id: string;
  room_id: string;
  seat_number: string;
  type?: SeatType;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSeatDTO {
  room_id: string;
  seat_number: string;
  type?: SeatType;
  is_active?: boolean;
}

export interface UpdateSeatDTO {
  room_id?: string;
  seat_number?: string;
  type?: SeatType;
  is_active?: boolean;
}

export interface SeatResponse {
  data: Seat[];
  error?: string;
}

export interface SeatDetailResponse {
  data: Seat;
  error?: string;
}
