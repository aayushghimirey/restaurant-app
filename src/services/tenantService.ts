import api from '../lib/api';
import type {
  ApiResponse, PagedResponse, Pageable,
  TenantResponse, CreateTenantRequest,
} from '../types';

const toParams = (p: Pageable) => ({ page: p.page, size: p.size });

export const tenantService = {
  getAll: async (pageable: Pageable) => {
    const res = await api.get<ApiResponse<PagedResponse<TenantResponse>>>(
      '/v1/superadmin/tenants',
      { params: toParams(pageable) }
    );
    return res.data;
  },

  create: async (data: CreateTenantRequest) => {
    const res = await api.post<ApiResponse<TenantResponse>>('/v1/superadmin/tenants', data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/superadmin/tenants/${id}`);
    return res.data;
  },
};
