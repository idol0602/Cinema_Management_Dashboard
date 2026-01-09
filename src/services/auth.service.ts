import api, { handleApiError } from "./api.ts";
import type {loginType, authResponse} from "@/types/auth.type.ts"

export const authService = {
    login: async(payload : loginType) : Promise<authResponse> => {
        try {
            const response = await api.post("/auth/login", payload);
            return {
                data: response.data.data,
                error: null
            };
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                data: {
                    user: {
                        name: "",
                        email: "",
                        phone: "",
                        role: "",
                        points: 0,
                        is_active: false,
                        created_at: ""
                    },
                    token: ""
                },
                error: apiError.message
            };
        }
    },
    forgotPassword: async(email: string): Promise<{success: boolean, message: string, error: string | null}> => {
        try {
            const response = await api.post("/auth/forgot-password", { email });
            return {
                success: response.data.success,
                message: response.data.message,
                error: null
            };
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                success: false,
                message: "",
                error: apiError.message
            };
        }
    },
    resetPassword: async(token: string, newPassword: string): Promise<{success: boolean, message: string, error: string | null}> => {
        try {
            const response = await api.post("/auth/reset-password", { token, newPassword });
            return {
                success: response.data.success,
                message: response.data.message,
                error: null
            };
        } catch (error) {
            const apiError = handleApiError(error);
            return {
                success: false,
                message: "",
                error: apiError.message
            };
        }
    }
}