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
    } 
}