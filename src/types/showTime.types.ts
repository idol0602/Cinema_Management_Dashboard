export type DayType = 'WEEKDAY' | 'WEEKEND';

export interface ShowTime {
  id: string;
  movie_id: string;
  room_id: string;
  start_time: string;
  end_time?: string;
  day_type: DayType;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShowTimeDTO {
  movie_id: string;
  room_id: string;
  start_time: string;
  end_time?: string;
  day_type: DayType;
  is_active?: boolean;
}

export interface UpdateShowTimeDTO {
  movie_id?: string;
  room_id?: string;
  start_time?: string;
  end_time?: string;
  day_type?: DayType;
  is_active?: boolean;
}

export interface ShowTimeResponse {
  data: ShowTime[];
  error?: string;
}

export interface ShowTimeDetailResponse {
  data: ShowTime;
  error?: string;
}
