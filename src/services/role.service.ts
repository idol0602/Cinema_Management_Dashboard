import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type {PaginationQuery, PaginatedResponse} from "@/types/pagination.type.ts"
import type {CreateRoleType, UpdateRoleType, RoleType} from "@/types/role.type.ts"

export const roleService = {
  getAll: async () : Promise<serviceResponse> => {
    try {
      const response = await api.get('/roles/all')
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
      const response = await api.get(`/roles/${id}`);
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

  create: async (data: CreateRoleType) : Promise<serviceResponse> => {
    try {
      const response = await api.post('/roles', data);
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

  update: async (id: string, data: UpdateRoleType) : Promise<serviceResponse>  => {
    try {
      const response = await api.put(`/roles/${id}`, data);
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
      await api.delete(`/roles/${id}`);
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

  findAndPaginate: async(query: PaginationQuery): Promise<PaginatedResponse<RoleType>> => {
    try {
      const response = await api.get("/roles", { params: query });
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
}
