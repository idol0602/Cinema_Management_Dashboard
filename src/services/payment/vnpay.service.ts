import api, { handleApiError } from "../api.ts"
import type {serviceResponse} from "../../types/api.type.ts"

export const vnpayService = {
  createPayment: async (data) : Promise<serviceResponse> => {
    try {
      const response = await api.post('/payment/vnpay/create', data);
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

  callbackResult: async (query) : Promise<serviceResponse> => {
    try {
      const response = await api.get('/payment/vnpay/callback', { params: query });
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
}
