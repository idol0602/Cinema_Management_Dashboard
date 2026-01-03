import type { serviceResponse } from "./api.type";

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  // Filterable columns
  title?: string;
  director?: string;
  rating?: number;
  release_date?: string;
  duration?: number;
  movie_type_id?: string;
  is_active?: boolean;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse extends serviceResponse {
  meta?: PaginationMeta;
  links?: PaginationLinks;
}