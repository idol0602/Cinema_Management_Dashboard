import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"

// Types
export interface MonthlyRevenue {
  month: number;
  revenue: number;
  tickets: number;
  orders: number;
}

export interface StatsSummary {
  total_revenue: number;
  total_tickets: number;
  total_orders: number;
  total_users: number;
}

export interface TopMovie {
  movie_id: string;
  title: string;
  revenue: number;
  tickets: number;
  rating: number;
}

export interface TopCombo {
  combo_id: string;
  name: string;
  sold: number;
  revenue: number;
}

export interface TopMenuItem {
  menu_item_id: string;
  name: string;
  sold: number;
  revenue: number;
}

export interface GenreDistribution {
  genre_id: string;
  genre: string;
  count: number;
  revenue: number;
}

export const statisticalService = {
  // Doanh thu theo tháng (chỉ phụ thuộc năm)
  getMonthlyRevenue: async (year: number): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/monthly-revenue?year=${year}`);
      return {
        data: response.data.data as MonthlyRevenue[],
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        success: false,
        error: apiError.message,
      };
    }
  },

  // Tổng quan thống kê
  getStatisticsSummary: async (month: number, year: number): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/summary?month=${month}&year=${year}`);
      return {
        data: response.data.data as StatsSummary,
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        success: false,
        error: apiError.message,
      };
    }
  },

  // Top phim doanh thu cao nhất
  getTopMovies: async (month: number, year: number, limit: number = 5): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/top-movies?month=${month}&year=${year}&limit=${limit}`);
      return {
        data: response.data.data as TopMovie[],
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        success: false,
        error: apiError.message,
      };
    }
  },

  // Top combo bán chạy
  getTopCombos: async (month: number, year: number, limit: number = 5): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/top-combos?month=${month}&year=${year}&limit=${limit}`);
      return {
        data: response.data.data as TopCombo[],
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        success: false,
        error: apiError.message,
      };
    }
  },

  // Top menu items bán chạy
  getTopMenuItems: async (month: number, year: number, limit: number = 6): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/top-menu-items?month=${month}&year=${year}&limit=${limit}`);
      return {
        data: response.data.data as TopMenuItem[],
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        success: false,
        error: apiError.message,
      };
    }
  },

  // Phân bố thể loại phim
  getGenreDistribution: async (month: number, year: number): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics/genre-distribution?month=${month}&year=${year}`);
      return {
        data: response.data.data as GenreDistribution[],
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [],
        success: false,
        error: apiError.message,
      };
    }
  },

  // Lấy tất cả thống kê cùng lúc
  getAllStatistics: async (month: number, year: number): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/statistics?month=${month}&year=${year}`);
      return {
        data: response.data.data,
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        success: false,
        error: apiError.message,
      };
    }
  },
};
