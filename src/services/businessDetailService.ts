import api from '../lib/api';
import type { ApiResponse, BusinessDetailResponse, BusinessDetailRequest } from '../types';

export const businessDetailService = {
  get: async () => {
    const res = await api.get<ApiResponse<BusinessDetailResponse>>('/v1/tenant/business-detail');
    return res.data;
  },

  saveOrUpdate: async (data: BusinessDetailRequest) => {
    const res = await api.put<ApiResponse<BusinessDetailResponse>>('/v1/tenant/business-detail', data);
    return res.data;
  },
};
