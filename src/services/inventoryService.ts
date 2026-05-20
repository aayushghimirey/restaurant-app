import api from '../lib/api';
import type { ApiResponse, PagedResponse } from '../types';
import type {
  StockItemResponse,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  UnitResponse,
  CreateCustomUnitRequest,
  InventoryTransactionResponse,
  StockAdjustmentRequest,
  PackagingUnitResponse,
  CreatePackagingUnitRequest,
  InventorySummaryResponse,
  InventoryCategoryResponse,
  InventoryCategoryRequest,
} from '../types/inventory';

export const inventoryService = {
  // Stock Items
  getAllStockItems: async (search?: string, categoryId?: string, page = 0, size = 12) => {
    const res = await api.get<ApiResponse<PagedResponse<StockItemResponse>>>('/v1/inventory/items', {
      params: { 
        search, 
        categoryId: categoryId === 'ALL' ? undefined : categoryId,
        page,
        size
      }
    });
    return res.data;
  },

  getStockItem: async (id: string) => {
    const res = await api.get<ApiResponse<StockItemResponse>>(`/v1/inventory/items/${id}`);
    return res.data;
  },

  createStockItem: async (data: CreateStockItemRequest) => {
    const res = await api.post<ApiResponse<StockItemResponse>>('/v1/inventory/items', data);
    return res.data;
  },

  updateStockItem: async (id: string, data: UpdateStockItemRequest) => {
    const res = await api.put<ApiResponse<StockItemResponse>>(`/v1/inventory/items/${id}`, data);
    return res.data;
  },

  getLowStockItems: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PagedResponse<StockItemResponse>>>('/v1/inventory/items/low-stock', {
      params: { page, size }
    });
    return res.data;
  },

  getInventorySummary: async () => {
    const res = await api.get<ApiResponse<InventorySummaryResponse>>('/v1/inventory/items/summary');
    return res.data;
  },


  // Units
  getSystemUnits: async (page = 0, size = 100) => {
    const res = await api.get<ApiResponse<PagedResponse<UnitResponse>>>('/v1/inventory/system-units', {
      params: { page, size }
    });
    return res.data;
  },

  getCustomUnits: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PagedResponse<UnitResponse>>>('/v1/inventory/custom-units', {
      params: { page, size }
    });
    return res.data;
  },

  createCustomUnit: async (data: CreateCustomUnitRequest) => {
    const res = await api.post<ApiResponse<UnitResponse>>('/v1/inventory/custom-units', data);
    return res.data;
  },

  deleteCustomUnit: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/inventory/custom-units/${id}`);
    return res.data;
  },

  // Packaging Units
  getPackagingUnits: async (stockItemId: string, page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PagedResponse<PackagingUnitResponse>>>(`/v1/inventory/items/${stockItemId}/packaging-units`, {
      params: { page, size }
    });
    return res.data;
  },

  createPackagingUnit: async (stockItemId: string, data: CreatePackagingUnitRequest) => {
    const res = await api.post<ApiResponse<PackagingUnitResponse>>(`/v1/inventory/items/${stockItemId}/packaging-units`, data);
    return res.data;
  },

  deletePackagingUnit: async (unitId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/inventory/packaging-units/${unitId}`);
    return res.data;
  },

  // Transactions
  getTransactions: async (page = 0, size = 20) => {
    const res = await api.get<ApiResponse<PagedResponse<InventoryTransactionResponse>>>('/v1/inventory/transactions', {
      params: { page, size }
    });
    return res.data;
  },

  adjustStock: async (data: StockAdjustmentRequest) => {
    const res = await api.post<ApiResponse<InventoryTransactionResponse>>('/v1/inventory/transactions/adjustment', data);
    return res.data;
  },

  // Inventory Categories
  getAllCategories: async (search?: string, page = 0, size = 100) => {
    const res = await api.get<ApiResponse<PagedResponse<InventoryCategoryResponse>>>('/v1/inventory/categories', {
      params: { search, page, size }
    });
    return res.data;
  },

  createCategory: async (data: InventoryCategoryRequest) => {
    const res = await api.post<ApiResponse<InventoryCategoryResponse>>('/v1/inventory/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: InventoryCategoryRequest) => {
    const res = await api.put<ApiResponse<InventoryCategoryResponse>>(`/v1/inventory/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/inventory/categories/${id}`);
    return res.data;
  },
};
