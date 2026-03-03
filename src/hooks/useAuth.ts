import { create } from 'zustand';
import type { User } from '@/types/user.type';
import type { AuthContextType } from '@/types/auth.type';
import { authService } from '@/services/auth.service';
import { socketService } from '@/lib/socket';
import { toast } from 'sonner';

interface AuthStore extends AuthContextType {
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAuth = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (response.error) {
        toast.error(response.error);
        set({ error: response.error, isLoading: false });
        throw new Error(response.error);
      }
      if (response.data) {
        set({ 
          user: response.data.user as User, 
          isAuthenticated: true, 
          isLoading: false, 
          error: null 
        });
        socketService.connect();
        toast.success("Đăng nhập thành công!");
      }
    } catch (error: any) {
      toast.error("Đăng nhập thất bại!");
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    set({ user: null, isAuthenticated: false, error: null });
    socketService.disconnect();
    toast.success("Đăng xuất thành công!");
    window.location.href = '/login';
  },
  updateProfile: async (updatedUser: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const { id: userId, ...updatedData } = updatedUser;
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await authService.updateProfile(userId as string, updatedData);
      
      if (response.error) {
        toast.error(response.error);
        set({ error: response.error, isLoading: false });
        throw new Error(response.error);
      }

      if (response.data) {
        set({ user: response.data.user as User, isLoading: false, error: null });
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error: any) {
      toast.error("Cập nhật thông tin thất bại!");
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  setError: (error: string | null) => {
    set({ error });
  },
}));