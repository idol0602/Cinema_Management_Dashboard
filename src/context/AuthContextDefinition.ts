import { createContext } from 'react';
import type { AuthContextType } from '../types';

/**
 * Contexto de Autenticação
 * Fornece estado global de autenticação para toda a aplicação
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
