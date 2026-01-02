import api, { handleApiError } from './api';
import type { Movie, CreateMovieDTO, UpdateMovieDTO, MovieResponse, MovieDetailResponse, ApiResponse } from '../types';

export const movieService = {

  getAll: async (): Promise<MovieResponse> => {
    try {
      const response = await api.get<ApiResponse<Movie[]>>('/movies');
      return {
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        error: apiError.message,
      };
    }
  },

  getById: async (id: string): Promise<MovieDetailResponse> => {
    try {
      const response = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
      return {
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {} as Movie,
        error: apiError.message,
      };
    }
  },

  create: async (data: CreateMovieDTO): Promise<MovieDetailResponse> => {
    try {
      const response = await api.post<ApiResponse<Movie>>('/movies', data);
      return {
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {} as Movie,
        error: apiError.message,
      };
    }
  },

  update: async (id: string, data: UpdateMovieDTO): Promise<MovieDetailResponse> => {
    try {
      const response = await api.put<ApiResponse<Movie>>(`/movies/${id}`, data);
      return {
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {} as Movie,
        error: apiError.message,
      };
    }
  },

  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/movies/${id}`);
      return {
        success: true,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        success: false,
        error: apiError.message,
      };
    }
  },
};