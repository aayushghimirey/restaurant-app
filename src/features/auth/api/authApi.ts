import { axiosInstance } from "../../../api/axios"
import { AuthRequest, AuthResponse, ApiResponse } from "../types"

export const authApi = {
  login: async (request: AuthRequest): Promise<AuthResponse> => {
   
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>("/auth/public/login", request)
    return response.data.data
  },
}
