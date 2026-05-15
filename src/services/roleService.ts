import api from '../lib/api';
import type {
  ApiResponse, PagedResponse, Pageable,
  RoleResponse, CreateRoleRequest,
} from '../types';

const toParams = (p: Pageable) => ({ page: p.page, size: p.size });

export const roleService = {
  getAll: async (pageable: Pageable) => {
    const res = await api.get<ApiResponse<PagedResponse<RoleResponse>>>(
      '/v1/tenant/roles',
      { params: toParams(pageable) }
    );
    return res.data;
  },

  create: async (data: CreateRoleRequest) => {
    const res = await api.post<ApiResponse<RoleResponse>>('/v1/tenant/roles', data);
    return res.data;
  },
};
