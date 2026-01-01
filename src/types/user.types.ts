export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  points?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  points?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  points?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface UserResponse {
  data: User[];
  error?: string;
}

export interface UserDetailResponse {
  data: User;
  error?: string;
}
