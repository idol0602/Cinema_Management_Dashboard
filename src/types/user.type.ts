export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
    name: string,
    email: string,
    phone?: string,
    password?: string,
    role: UserRole,
    points?: number,
    is_active?: boolean,
    created_at?: string
}