import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type {PaginationQuery, PaginatedResponse} from "@/types/pagination.type.ts"
import type { CreateOrderType, UpdateOrderType,OrderType } from "@/types/order.type.ts"

export const orderService = {
  getAll: async () : Promise<serviceResponse> => {
    try {
      const response = await api.get('/orders/all')
      return {
        data: response.data.data,
        success : true,
        error: response.data.error
      }
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data:[],
        success: false,
        error: apiError.message
      }
    }
  },

  getById: async (id: string) : Promise<serviceResponse> => {
    try {
      const response = await api.get(`/orders/${id}`);
      return {
        data: response.data.data,
        success : true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {},
        success : false,
        error: apiError.message
      }
    }
  },

  create: async (data: CreateOrderType) : Promise<serviceResponse> => {
    try {
      const response = await api.post('/orders', data);
      return {
        data: response.data.data,
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {},
        success: false,
        error: apiError.message,
      };
    }
  },

  update: async (id: string, data: UpdateOrderType) : Promise<serviceResponse>  => {
    try {
      const response = await api.put(`/orders/${id}`, data);
      return {
        data: response.data.data,
        success: true,
        error: response.data.error,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {},
        success: false,
        error: apiError.message,
      };
    }
  },

  delete: async (id: string) : Promise<serviceResponse> => {
    try {
      await api.delete(`/orders/${id}`);
      return {
        data: {},
        success: true,
        error: ""
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: {},
        success: false,
        error: apiError.message,
      };
    }
  },

  findAndPaginate: async(query: PaginationQuery): Promise<PaginatedResponse<OrderType>> => {
    try {
      const response = await api.get("/orders", { params: query });
      return {
            data: response.data.data,
            success: true,
            error: response.data.error || "",
            meta: response.data.meta,
            links: response.data.links
        };
    } catch (error) {
      const apiError = handleApiError(error);
       return {
            data: [],
            success: false,
            error: apiError.message
        };
    }
  },

  getOrderDetails: async (id: string): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/orders/detail/${id}`);
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
}
