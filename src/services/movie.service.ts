import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type { movieType } from "@/types/movie.type.ts"
import type {PaginationQuery, PaginatedResponse} from "@/types/pagination.type.ts"

export const movieService = {
    getAll: async () : Promise<serviceResponse> => {
        try {
            const response = await api.get('/movies/all')
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
            const response = await api.get(`/movies/${id}`);
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

    create: async (data: movieType) : Promise<serviceResponse> => {
    try {
      const response = await api.post('/movies', data);
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

  update: async (id: string, data: movieType) : Promise<serviceResponse>  => {
    try {
      const response = await api.put(`/movies/${id}`, data);
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
      await api.delete(`/movies/${id}`);
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

  findAndPaginate: async(query: PaginationQuery): Promise<PaginatedResponse> => {
    try {
        const response = await api.get("/movies", { params: query });
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
  }
}