import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, RegisterRequest, AuthContextType } from "../types";
import api from "../services/api";
import { AuthContext } from "./AuthContextDefinition";

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error("Erro ao recuperar dados de autenticação:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Fazer login
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ data: AuthResponse }>("/auth/login", {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);

      // Update state
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fazer register
   */
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ data: AuthResponse }>(
        "/auth/register",
        data
      );

      const { user: userData, token: authToken } = response.data.data;

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);

      // Update state
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error("Erro ao fazer registro:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fazer logout
   */
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
