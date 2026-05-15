import api from '../lib/api';
import type {
  ApiResponse, PagedResponse, Pageable,
  StaffResponse, CreateStaffRequest, UpdateStaffRequest
} from '../types';

const toParams = (p: Pageable, search?: string) => ({ 
  page: p.page, 
  size: p.size,
  search: search || undefined
});

export const staffService = {
  getAll: async (pageable: Pageable, search?: string) => {
    const res = await api.get<ApiResponse<PagedResponse<StaffResponse>>>(
      '/v1/tenant/staff',
      { params: toParams(pageable, search) }
    );
    return res.data;
  },

  update: async (id: string, data: UpdateStaffRequest) => {
    const res = await api.put<ApiResponse<StaffResponse>>(
      `/v1/tenant/staff/${id}`,
      data
    );
    return res.data;
  },

  create: async (data: CreateStaffRequest, roleId?: string) => {
    const res = await api.post<ApiResponse<StaffResponse>>(
      '/v1/tenant/staff',
      data,
      { params: roleId ? { roleId } : {} }
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/tenant/staff/${id}`);
    return res.data;
  },
};
