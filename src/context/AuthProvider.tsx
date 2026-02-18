import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/user.type.ts";
import { authService } from "@/services/auth.service.ts";
import { AuthContext } from "./AuthContext.tsx";
import { toast } from "sonner";
import { userService } from "@/services/user.service.ts";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = () => {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("user");
          throw error;
        }
      }

      setLoading(false);
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
      const { user } = data;
      setUser(user as User);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error("Đăng nhập thất bại!");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.id) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  }, [user, navigate]);

  const updateProfile = useCallback(async (updatedUser: Partial<User>) => {
    try {
      setLoading(true);
      const { id: userId, ...updatedData } = updatedUser;
      const { data, error } = await authService.updateProfile(
        userId as string,
        updatedData,
      );
      if (error) {
        toast.error(error);
        throw new Error(error);
      }

      const { user } = data;
      setUser(user as User);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(user));
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
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
