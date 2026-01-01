import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextDefinition';
import type { AuthContextType } from '../types';

/**
 * Custom Hook para acessar contexto de autenticação
 * Fornece informações sobre o usuário e métodos de auth
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};
