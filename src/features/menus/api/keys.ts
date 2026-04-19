import type { GetMenusQueryRequest } from '../types';

export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (params: GetMenusQueryRequest) => [...menuKeys.lists(), params] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  ingredients: (id: string) => [...menuKeys.detail(id), 'ingredients'] as const,
};
