import type {User} from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface AuthAction {
  type: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'SET_LOADING';
  payload?: any;
}
