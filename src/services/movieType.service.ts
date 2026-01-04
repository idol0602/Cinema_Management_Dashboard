import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type { movieTypeType } from "@/types/movieType.type.ts"

export const movieTypeService = {
  getAll: async () : Promise<serviceResponse> => {
        try {
            const response = await api.get('/movie-types/all')
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
            const response = await api.get(`/movie-types/${id}`);
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

  create: async (data: movieTypeType) : Promise<serviceResponse> => {
    try {
      const response = await api.post('/movie-types', data);
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

  update: async (id: string, data: movieTypeType) : Promise<serviceResponse>  => {
    try {
      const response = await api.put(`/movie-types/${id}`, data);
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
      await api.delete(`/movie-types/${id}`);
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
}