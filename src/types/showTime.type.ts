export type DayType = "WEEKDAY" | "WEEKEND";

export interface ShowTimeType {
  id?: string;
  movie_id: string;
  room_id: string;
  start_time: string;
  end_time?: string;
  day_type: DayType;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateShowTimeType {
  movie_id: string;
  room_id: string;
  start_time: string;
  end_time?: string;
  day_type: DayType;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateShowTimeType {
  movie_id?: string;
  room_id?: string;
  start_time?: string;
  end_time?: string;
  day_type?: DayType;
  is_active?: boolean;
  created_at?: string;
}