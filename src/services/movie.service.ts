import api, { handleApiError } from './api';
import type { Movie, CreateMovieDTO, UpdateMovieDTO, MovieResponse, MovieDetailResponse, ApiResponse } from '../types';

/**
 * Movie Service - Gerencia todas as operações com filmes
 * Corresponde aos endpoints: /api/movies
 */
export const movieService = {
  /**
   * Busca todos os filmes
   * GET /movies
   */
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

  /**
   * Busca um filme por ID
   * GET /movies/:id
   */
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

  /**
   * Cria um novo filme
   * POST /movies
   * Requer autenticação e role ADMIN/STAFF
   */
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

  /**
   * Atualiza um filme existente
   * PUT /movies/:id
   * Requer autenticação e role ADMIN/STAFF
   */
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

  /**
   * Deleta um filme (soft delete - marca como inativo)
   * DELETE /movies/:id
   * Requer autenticação e role ADMIN
   */
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