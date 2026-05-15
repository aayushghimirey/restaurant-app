import api from '../lib/api';
import type {
  ApiResponse, PagedResponse, Pageable,
  BranchResponse, CreateBranchRequest,
} from '../types';

const toParams = (p: Pageable) => ({ page: p.page, size: p.size });

export const branchService = {
  getAll: async (pageable: Pageable) => {
    const res = await api.get<ApiResponse<PagedResponse<BranchResponse>>>(
      '/v1/tenant/branches',
      { params: toParams(pageable) }
    );
    return res.data;
  },

  create: async (data: CreateBranchRequest) => {
    const res = await api.post<ApiResponse<BranchResponse>>('/v1/tenant/branches', data);
    return res.data;
  },
};
