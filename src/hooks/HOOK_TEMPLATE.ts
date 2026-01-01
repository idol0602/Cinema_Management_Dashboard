/**
 * TEMPLATE PARA CRIAR NOVOS HOOKS
 * 
 * Instruções:
 * 1. Copiar este arquivo
 * 2. Renomear para: use[ENTITY].ts
 * 3. Substituir "ENTITY" pelo nome da entidade (ex: User, Room, Combo)
 * 4. Ajustar tipos e chamadas de service
 * 
 * Exemplo: Para useUser Hook
 * - Substituir "Movie" por "User"
 * - Substituir "movieService" por "userService"
 * - Importar types de user.types.ts
 */

import { useState, useCallback, useEffect } from 'react';
import {
  // ENTITY,
  // CreateENTITYDTO,
  // UpdateENTITYDTO,
} from '../types';
// import { entityService } from '../services/entity.service';

interface UseEntityState {
  entities: any[];
  entity: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom Hook para gerenciar dados de [ENTITY]
 * Fornece métodos para buscar, criar, atualizar e deletar [entity]
 */
export const useEntity = () => {
  const [state, setState] = useState<UseEntityState>({
    entities: [],
    entity: null,
    loading: false,
    error: null,
  });

  /**
   * Busca todos os [entity]
   */
  const fetchEntities = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const response = await entityService.getAll();
      // if (response.error) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: response.error,
      //     loading: false,
      //   }));
      // } else {
      //   setState((prev) => ({
      //     ...prev,
      //     entities: response.data,
      //     loading: false,
      //   }));
      // }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar entidades';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Busca uma entidade por ID
   */
  const fetchEntityById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const response = await entityService.getById(id);
      // if (response.error) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: response.error,
      //     loading: false,
      //   }));
      // } else {
      //   setState((prev) => ({
      //     ...prev,
      //     entity: response.data,
      //     loading: false,
      //   }));
      // }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao buscar entidade';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Cria uma nova entidade
   */
  const createEntity = useCallback(async (data: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const response = await entityService.create(data);
      // if (response.error) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: response.error,
      //     loading: false,
      //   }));
      //   return null;
      // } else {
      //   setState((prev) => ({
      //     ...prev,
      //     entity: response.data,
      //     entities: [...prev.entities, response.data],
      //     loading: false,
      //   }));
      //   return response.data;
      // }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao criar entidade';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Atualiza uma entidade
   */
  const updateEntity = useCallback(async (id: string, data: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const response = await entityService.update(id, data);
      // if (response.error) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: response.error,
      //     loading: false,
      //   }));
      //   return null;
      // } else {
      //   setState((prev) => ({
      //     ...prev,
      //     entity: response.data,
      //     entities: prev.entities.map((e) => (e.id === id ? response.data : e)),
      //     loading: false,
      //   }));
      //   return response.data;
      // }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao atualizar entidade';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Deleta uma entidade
   */
  const deleteEntity = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const response = await entityService.delete(id);
      // if (!response.success) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: response.error || 'Erro ao deletar entidade',
      //     loading: false,
      //   }));
      //   return false;
      // } else {
      //   setState((prev) => ({
      //     ...prev,
      //     entities: prev.entities.filter((e) => e.id !== id),
      //     loading: false,
      //   }));
      //   return true;
      // }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao deletar entidade';
      setState((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      return false;
    }
  }, []);

  /**
   * Busca entidades ao montar o componente
   */
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  return {
    // Estado
    entities: state.entities,
    entity: state.entity,
    loading: state.loading,
    error: state.error,

    // Métodos
    fetchEntities,
    fetchEntityById,
    createEntity,
    updateEntity,
    deleteEntity,

    // Helpers
    clearError: () => setState((prev) => ({ ...prev, error: null })),
    clearEntity: () => setState((prev) => ({ ...prev, entity: null })),
  };
};

/**
 * PADRÃO RECOMENDADO:
 * 
 * Sempre retornar objeto com:
 * - estado (entidades, loading, error)
 * - métodos (fetch, create, update, delete)
 * - helpers (clearError, etc)
 * 
 * Uso em componente:
 * const { entities, loading, error, createEntity, updateEntity, deleteEntity } = useEntity();
 */
