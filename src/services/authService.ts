import api from '../lib/api';
import type {
  LoginRequest, AuthResponse,
  ApiResponse,
} from '../types';

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/v1/auth/login', data);
    return res.data;
  },

  switchBranch: async (branchId: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>(`/v1/auth/switch-branch/${branchId}`);
    return res.data;
  },
};
