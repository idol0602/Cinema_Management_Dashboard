export interface MovieType {
  id: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface Movie {
  id: string;
  title: string;
  director: string;
  description?: string;
  release_date?: string;
  duration?: number;
  rating?: number;
  image?: string;
  thumbnail?: string;
  trailer?: string;
  movie_type_id: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMovieDTO {
  title: string;
  director: string;
  description?: string;
  release_date?: string;
  duration?: number;
  rating?: number;
  image?: string;
  thumbnail?: string;
  trailer?: string;
  movie_type_id: string;
  is_active?: boolean;
}

export interface UpdateMovieDTO {
  title?: string;
  director?: string;
  description?: string;
  release_date?: string;
  duration?: number;
  rating?: number;
  image?: string;
  thumbnail?: string;
  trailer?: string;
  movie_type_id?: string;
  is_active?: boolean;
}

export interface CreateMovieTypeDTO {
  type: string;
}

export interface UpdateMovieTypeDTO {
  type?: string;
}

export interface MovieResponse {
  data: Movie[];
  error?: string;
}

export interface MovieDetailResponse {
  data: Movie;
  error?: string;
}

export interface MovieTypeResponse {
  data: MovieType[];
  error?: string;
}

export interface MovieTypeDetailResponse {
  data: MovieType;
  error?: string;
}