import api from '../lib/api';
import type {
  ApiResponse,
  PagedResponse,
  TableResponse,
  CreateTableRequest,
  TableStatus,
  TableSummaryResponse
} from '../types';

export const tableService = {
  getTables: async (search?: string, status?: TableStatus, page = 0, size = 20) => {
    const res = await api.get<ApiResponse<PagedResponse<TableResponse>>>('/tables', {
      params: {
        search,
        status,
        page,
        size
      }
    });
    return res.data;
  },

  createTable: async (data: CreateTableRequest) => {
    const res = await api.post<ApiResponse<TableResponse>>('/tables', data);
    return res.data;
  },

  getTableById: async (id: string) => {
    const res = await api.get<ApiResponse<TableResponse>>(`/tables/${id}`);
    return res.data;
  },

  getTableSummary: async () => {
    const res = await api.get<ApiResponse<TableSummaryResponse>>('/tables/summary');
    return res.data;
  },

  enableTable: async (id: string) => {
    const res = await api.get<ApiResponse<null>>(`/tables/enable/${id}`);
    return res.data;
  },

  disableTable: async (id: string) => {
    const res = await api.get<ApiResponse<null>>(`/tables/disable/${id}`);
    return res.data;
  }
};
