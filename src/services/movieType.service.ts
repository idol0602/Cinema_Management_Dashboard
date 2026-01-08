import api, {handleApiError} from "./api";
import type { movieTypeType } from "@/types/movieType.type"; 
import type {PaginationQuery, PaginatedResponse} from "@/types/pagination.type.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type { movieType } from "@/types/movie.type";

export const movieTypeService = {

    create : async(data : movieTypeType) : Promise<serviceResponse> => {
        try {
            const response = await api.post('/movie-types',data);
            return {
                data: response.data.data,
                success : true,
                error: response.data.error
            }
        } catch (e) {
            const apiError = handleApiError(e);
            return {
                data: [],
                success : false,
                error: apiError.message
            }
        }
    },

    findAll : async() : Promise<serviceResponse> => {
        try {
            const response = await api.get('/movie-types/all');
            return {
                data: response.data.data,
                success : true,
                error: response.data.error
            }
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                data: [],
                success : false,
                error: apiError.message
            }
        }
    },

    findById : async(id: string) : Promise<serviceResponse> => {
        try {
            const response = await api.get(`/movie-types/${id}`);
            return {
                data: response.data.data,
                success : true,
                error: response.data.error
            }
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                data: [],
                success : false,
                error: apiError.message
            }
        }   
    },
    
    update : async(id: string, data: movieTypeType) : Promise<serviceResponse> => {
        try {
            const response = await api.put(`/movie-types/${id}`, data);
            return {
                data: response.data.data,
                success : true,
                error: response.data.error
            }
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                data: [],
                success : false,
                error: apiError.message
            }
        }
    },
    
    remove : async(id: string) : Promise<serviceResponse> => {
        try {
            const response = await api.delete(`/movie-types/${id}`);
            return {
                data: response.data.data,
                success : true,
                error: response.data.error
            }
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                data: [],
                success : false,
                error: apiError.message
            }
        }
    },

    findAndPaginate: async(query: PaginationQuery): Promise<PaginatedResponse<movieType>> => {
    try {
        const response = await api.get("/movie-types", { params: query });
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
            data: [] as movieType[],
            success: false,
            error: apiError.message
        };
    }
  },
}