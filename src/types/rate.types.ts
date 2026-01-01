export interface Rate {
  id: string;
  movie_id: string;
  user_id: string;
  stars: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRateDTO {
  movie_id: string;
  user_id: string;
  stars: number;
  created_at?: string;
}

export interface UpdateRateDTO {
  movie_id?: string;
  user_id?: string;
  stars?: number;
  created_at?: string;
}

export interface RateResponse {
  data: Rate[];
  error?: string;
}

export interface RateDetailResponse {
  data: Rate;
  error?: string;
}
