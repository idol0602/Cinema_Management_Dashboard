import api, { handleApiError } from "./api";
import type { AuthorizeType, CreateAuthorizeType, UpdateAuthorizeType } from "@/types/authorize.type";
import type { serviceResponse } from "@/types/api.type";
import type { PaginationQuery, PaginatedResponse } from "@/types/pagination.type";

export const authorizeService = {
  create: async (data: CreateAuthorizeType): Promise<serviceResponse> => {
    try {
      const response = await api.post("/authorizes", data);
      return {
        data: response.data.data,
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

  findAll: async (): Promise<serviceResponse> => {
    try {
      const response = await api.get("/authorizes/all");
      return {
        data: response.data.data,
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

  findById: async (id: string): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/authorizes/${id}`);
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

  findByRoleId: async (roleId: string): Promise<serviceResponse> => {
    try {
      const response = await api.get(`/authorizes/role/${roleId}`);
      return {
        data: response.data.data,
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

  update: async (id: string, data: UpdateAuthorizeType): Promise<serviceResponse> => {
    try {
      const response = await api.put(`/authorizes/${id}`, data);
      return {
        data: response.data.data,
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

  remove: async (id: string): Promise<serviceResponse> => {
    try {
      const response = await api.delete(`/authorizes/${id}`);
      return {
        data: response.data.data,
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

  findAndPaginate: async (query: PaginationQuery): Promise<PaginatedResponse<AuthorizeType>> => {
    try {
      const response = await api.get("/authorizes", { params: query });
      return {
        data: response.data.data,
        success: true,
        error: response.data.error || "",
        meta: response.data.meta,
        links: response.data.links,
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: [] as AuthorizeType[],
        success: false,
        error: apiError.message,
      };
    }
  },
};
