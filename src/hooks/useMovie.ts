import { useState, useCallback, useEffect } from 'react';
import type { Movie, CreateMovieDTO, UpdateMovieDTO } from '../types';
import { movieService } from '../services/movie.service';

interface UseMovieState {
  movies: Movie[];
  movie: Movie | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom Hook para gerenciar dados de Filmes
 * Fornece métodos para buscar, criar, atualizar e deletar filmes
 */
export const useMovie = () => {
  const [state, setState] = useState<UseMovieState>({
    movies: [],
    movie: null,
    loading: false,
    error: null,
  });

  /**
   * Busca todos os filmes
   */
  const fetchMovies = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movieService.getAll();
      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error || null,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          movies: response.data,
          loading: false,
        }));
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar filmes';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Busca um filme por ID
   */
  const fetchMovieById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movieService.getById(id);
      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error || null,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          movie: response.data,
          loading: false,
        }));
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar filme';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Cria um novo filme
   */
  const createMovie = useCallback(async (data: CreateMovieDTO) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movieService.create(data);
      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error || null,
          loading: false,
        }));
        return null;
      } else {
        setState((prev) => ({
          ...prev,
          movie: response.data,
          movies: [...prev.movies, response.data],
          loading: false,
        }));
        return response.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao criar filme';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Atualiza um filme
   */
  const updateMovie = useCallback(async (id: string, data: UpdateMovieDTO) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movieService.update(id, data);
      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error || null,
          loading: false,
        }));
        return null;
      } else {
        setState((prev) => ({
          ...prev,
          movie: response.data,
          movies: prev.movies.map((m) => (m.id === id ? response.data : m)),
          loading: false,
        }));
        return response.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao atualizar filme';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Deleta um filme
   */
  const deleteMovie = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movieService.delete(id);
      if (!response.success) {
        setState((prev) => ({
          ...prev,
          error: response.error || 'Erro ao deletar filme',
          loading: false,
        }));
        return false;
      } else {
        setState((prev) => ({
          ...prev,
          movies: prev.movies.filter((m) => m.id !== id),
          loading: false,
        }));
        return true;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao deletar filme';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return false;
    }
  }, []);

  /**
   * Busca filmes ao montar o componente
   */
  useEffect(() => {
    let isMounted = true;
    
    const loadMovies = async () => {
      if (isMounted) {
        await fetchMovies();
      }
    };
    
    void loadMovies();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Estado
    movies: state.movies,
    movie: state.movie,
    loading: state.loading,
    error: state.error,

    // Métodos
    fetchMovies,
    fetchMovieById,
    createMovie,
    updateMovie,
    deleteMovie,

    // Helpers
    clearError: () => setState((prev) => ({ ...prev, error: null })),
    clearMovie: () => setState((prev) => ({ ...prev, movie: null })),
  };
};
