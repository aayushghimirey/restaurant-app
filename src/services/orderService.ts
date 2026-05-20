import api from '../lib/api';
import type { ApiResponse, PagedResponse, Pageable, OrderResponse, CreateOrderRequest } from '../types';

export const orderService = {
  getAll: async (pageable: Pageable, statuses?: string[]) => {
    const res = await api.get<ApiResponse<PagedResponse<OrderResponse>>>(
      '/v1/orders',
      { params: { 
        page: pageable.page, 
        size: pageable.size,
        orderStatuses: statuses
      } }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<OrderResponse>>(
      `/v1/orders/${id}`
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

  cancel: async (orderId: string) => {
    const res = await api.post<ApiResponse<OrderResponse>>(
      `/v1/orders/${orderId}/cancel`
    );
    return res.data;
  },
  
  update: async (orderId: string, data: CreateOrderRequest) => {
    const res = await api.put<ApiResponse<OrderResponse>>(
      `/v1/orders/${orderId}`,
      data
    );
    return res.data;
  },
};

