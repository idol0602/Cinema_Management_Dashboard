import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/types/user.type.ts";
import { authService } from "@/services/auth.service.ts";
import { AuthContext } from "./AuthContext.tsx";
import { isTokenExpired } from "@/utils/token.ts";
import { toast } from "sonner";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true); // Đổi thành true

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        // Kiểm tra token đã hết hạn chưa
        if (isTokenExpired(savedToken)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoading(false);
          return;
        }

        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          throw error;
        }
      }

      setLoading(false); // Đặt loading = false sau khi kiểm tra xong
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.login({ email, password });
      if (error) {
        toast.error(error);
        throw new Error(error);
      }

      const { user, token } = data;
      setUser(user as User);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error("Đăng nhập thất bại!");
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
    toast.success("Đăng xuất thành công!");
  }, []);

  const updateProfile = useCallback(async (updatedUser: Partial<User>) => {
    try {
      setLoading(true);
      const { id: userId, ...updatedData } = updatedUser;
      const { data, error } = await authService.updateProfile(
        userId as string,
        updatedData
      );
      if (error) {
        toast.error(error);
        throw new Error(error);
      }

      const { user, token } = data;
      console.log("token", token);
      setUser(user as User);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại!");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
