export type SeatStatus = 'AVAILABLE' | 'HOLDING' | 'BOOKED' | 'FIXING';

export interface ShowTimeSeat {
  id: string;
  show_time_id: string;
  seat_id: string;
  status_seat?: SeatStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShowTimeSeatDTO {
  show_time_id: string;
  seat_id: string;
  status_seat?: SeatStatus;
}

export interface UpdateShowTimeSeatDTO {
  show_time_id?: string;
  seat_id?: string;
  status_seat?: SeatStatus;
}

export interface ShowTimeSeatResponse {
  data: ShowTimeSeat[];
  error?: string;
}

export interface ShowTimeSeatDetailResponse {
  data: ShowTimeSeat;
  error?: string;
}
