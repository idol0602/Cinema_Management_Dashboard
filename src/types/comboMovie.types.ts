export interface ComboMovie {
  id: string;
  combo_id: string;
  movie_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComboMovieDTO {
  combo_id: string;
  movie_id: string;
}

export interface UpdateComboMovieDTO {
  combo_id?: string;
  movie_id?: string;
}

export interface ComboMovieResponse {
  data: ComboMovie[];
  error?: string;
}

export interface ComboMovieDetailResponse {
  data: ComboMovie;
  error?: string;
}
