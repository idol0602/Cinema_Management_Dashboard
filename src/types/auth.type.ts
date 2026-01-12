import type { User } from "./user.type"
export interface loginType {
    email: string,
    password: string
}

export interface authResponse{
    data: { 
        user: {
            name: string,
            email: string
            phone: string
            role: string
            points: number
            is_active: boolean
            created_at: string
        }, 
        token : string 
    },
    error: string | null,
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean,
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updatedUser: User) => Promise<void>;
}