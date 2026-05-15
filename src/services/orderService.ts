import api from '../lib/api';
import type { ApiResponse, PagedResponse, Pageable, OrderResponse, CreateOrderRequest } from '../types';

export const orderService = {
  getAll: async (pageable: Pageable) => {
    const res = await api.get<ApiResponse<PagedResponse<OrderResponse>>>(
      '/v1/orders',
      { params: { page: pageable.page, size: pageable.size } }
    );
    return res.data;
  },

  create: async (data: CreateOrderRequest) => {
    const res = await api.post<ApiResponse<OrderResponse>>(
      '/v1/orders',
      data
    );
    return res.data;
  },
};
