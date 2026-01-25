import api, { handleApiError } from "./api.ts"
import type {serviceResponse} from "../types/api.type.ts"
import type {PaginationQuery, PaginatedResponse} from "@/types/pagination.type.ts"
import type {CreateComboType, UpdateComboType, ComboType} from "@/types/combo.type.ts"
import type {CreateComboItemType} from "../types/comboItem.type.ts"
import type {CreateComboMovieType} from "../types/comboMovie.type.ts"
import type {CreateComboEventType} from "../types/comboEvent.type.ts"

export const comboService = {
  getAll: async () : Promise<serviceResponse> => {
    try {
      const response = await api.get('/combos/all')
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
      const response = await api.get(`/combos/${id}`);
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

  create: async (combo: CreateComboType, comboItems?: CreateComboItemType[], comboMovie?: CreateComboMovieType, comboEvent?: CreateComboEventType) : Promise<serviceResponse> => {
    try {
      const payload = {
        combo,
        comboItems : comboItems || [],
        comboMovie : comboMovie || {},
        comboEvent : comboEvent || {},
      }
      const response = await api.post('/combos', payload);
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

  update: async (id: string, data: UpdateComboType) : Promise<serviceResponse>  => {
    try {
      const response = await api.put(`/combos/${id}`, data);
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
      await api.delete(`/combos/${id}`);
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

  findAndPaginate: async(query: PaginationQuery): Promise<PaginatedResponse<ComboType>> => {
    try {
      const response = await api.get("/combos", { params: query });
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