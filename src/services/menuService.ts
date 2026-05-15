import api from '../lib/api';
import type {
  ApiResponse,
  MenuCategoryResponse, CreateMenuCategoryRequest,
  MenuItemResponse, CreateMenuItemRequest,
  MenuRecipeResponse, CreateMenuRecipeRequest,
  MenuOptionResponse, CreateMenuOptionRequest,
  PagedResponse
} from '../types';

export const menuService = {
  // Categories
  getCategories: async () => {
    const res = await api.get<ApiResponse<MenuCategoryResponse[]>>('/v1/menu/categories');
    return res.data;
  },

  createCategory: async (data: CreateMenuCategoryRequest) => {
    const res = await api.post<ApiResponse<MenuCategoryResponse>>('/v1/menu/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: CreateMenuCategoryRequest) => {
    const res = await api.put<ApiResponse<MenuCategoryResponse>>(`/v1/menu/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/menu/categories/${id}`);
    return res.data;
  },

  // Menu Items
  getMenuItems: async (search?: string, categoryId?: string, page = 0, size = 12) => {
    const res = await api.get<ApiResponse<PagedResponse<MenuItemResponse>>>('/v1/menu/items', {
      params: {
        search,
        categoryId: categoryId === 'ALL' ? undefined : categoryId,
        page,
        size
      }
    });
    return res.data;
  },

  createMenuItem: async (data: CreateMenuItemRequest) => {
    const res = await api.post<ApiResponse<MenuItemResponse>>('/v1/menu/items', data);
    return res.data;
  },

  updateMenuItem: async (itemId: string, data: CreateMenuItemRequest) => {
    const res = await api.put<ApiResponse<MenuItemResponse>>(`/v1/menu/items/${itemId}`, data);
    return res.data;
  },

  toggleAvailability: async (itemId: string) => {
    const res = await api.patch<ApiResponse<MenuItemResponse>>(`/v1/menu/items/${itemId}/toggle`);
    return res.data;
  },

  deleteMenuItem: async (itemId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/menu/items/${itemId}`);
    return res.data;
  },

  // Recipes
  getRecipe: async (itemId: string) => {
    const res = await api.get<ApiResponse<MenuRecipeResponse[]>>(`/v1/menu/items/${itemId}/recipe`);
    return res.data;
  },

  addRecipeIngredient: async (itemId: string, data: CreateMenuRecipeRequest) => {
    const res = await api.post<ApiResponse<MenuRecipeResponse>>(`/v1/menu/items/${itemId}/recipe`, data);
    return res.data;
  },

  removeRecipeIngredient: async (recipeId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/menu/recipe/${recipeId}`);
    return res.data;
  },

  // Options
  getOptions: async (itemId: string) => {
    const res = await api.get<ApiResponse<MenuOptionResponse[]>>(`/v1/menu/items/${itemId}/options`);
    return res.data;
  },

  addOption: async (itemId: string, data: CreateMenuOptionRequest) => {
    const res = await api.post<ApiResponse<MenuOptionResponse>>(`/v1/menu/items/${itemId}/options`, data);
    return res.data;
  },

  addOptionStock: async (optionId: string, data: CreateMenuRecipeRequest) => {
    const res = await api.post<ApiResponse<MenuRecipeResponse>>(`/v1/menu/options/${optionId}/stock`, data);
    return res.data;
  },

  getOptionStock: async (optionId: string) => {
    const res = await api.get<ApiResponse<MenuRecipeResponse[]>>(`/v1/menu/options/${optionId}/stock`);
    return res.data;
  },

  deleteOption: async (optionId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/menu/options/${optionId}`);
    return res.data;
  },

  removeOptionStock: async (optionId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/menu/options/${optionId}/stock`);
    return res.data;
  },
};
