export interface ComboMovieType {
  id?: string;
  combo_id: string;
  movie_id: string;
  created_at?: string;
}

export interface CreateComboMovieType {
  combo_id: string;
  movie_id: string;
  created_at?: string;
}

export interface UpdateComboMovieType {
  combo_id?: string;
  movie_id?: string;
  created_at?: string;
}