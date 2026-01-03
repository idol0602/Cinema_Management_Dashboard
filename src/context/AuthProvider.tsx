import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/types/user.type.ts";
import { authService } from "@/services/auth.service.ts";
import { AuthContext } from "./AuthContext.tsx";
import { isTokenExpired } from "@/utils/token.ts";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      // Kiểm tra token đã hết hạn chưa
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.log(error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.login({ email, password });

      if (error) {
        throw new Error(error);
      }

      const { user, token } = data;
      setUser(user as User);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
