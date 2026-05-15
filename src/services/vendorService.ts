import api from '../lib/api';
import type { ApiResponse, PagedResponse, VendorResponse, CreateVendorRequest } from '../types';

export const vendorService = {
  getAll: async (search?: string, page = 0, size = 12) => {
    const res = await api.get<ApiResponse<PagedResponse<VendorResponse>>>('/v1/vendors', {
      params: {
        name: search,
        page,
        size
      }
    });
    return res.data;
  },

  create: async (data: CreateVendorRequest) => {
    const res = await api.post<ApiResponse<VendorResponse>>('/v1/vendors', data);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<VendorResponse>>(`/v1/vendors/${id}`);
    return res.data;
  }
};
