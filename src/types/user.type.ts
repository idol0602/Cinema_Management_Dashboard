export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
    id?: string;
    name: string,
    email: string,
    phone?: string,
    password?: string,
    role: UserRole,
    points?: number,
    is_active?: boolean,
    created_at?: string,
    is_online?: boolean,
    last_seen?: string,
}

export interface CreateUserType {
    name: string,
    email: string,
    phone?: string,
    password: string,
    role?: UserRole,
    points?: number,
    is_active?: boolean,
    created_at?: string
}

export interface UpdateUserType {
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    role?: UserRole,
    points?: number,
    is_active?: boolean,
    created_at?: string
}