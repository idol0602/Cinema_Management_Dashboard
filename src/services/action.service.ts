import api, { handleApiError } from "./api";
import type { ActionType, CreateActionType, UpdateActionType } from "@/types/action.type";
import type { serviceResponse } from "@/types/api.type";
import type { PaginationQuery, PaginatedResponse } from "@/types/pagination.type";

export const actionService = {
  create: async (data: CreateActionType): Promise<serviceResponse> => {
    try {
      const response = await api.post("/actions", data);
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
      const response = await api.get("/actions/all");
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
      const response = await api.get(`/actions/${id}`);
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

  update: async (id: string, data: UpdateActionType): Promise<serviceResponse> => {
    try {
      const response = await api.put(`/actions/${id}`, data);
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
      const response = await api.delete(`/actions/${id}`);
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

  findAndPaginate: async (query: PaginationQuery): Promise<PaginatedResponse<ActionType>> => {
    try {
      const response = await api.get("/actions", { params: query });
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
        data: [] as ActionType[],
        success: false,
        error: apiError.message,
      };
    }
  },
};
