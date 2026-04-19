import { useFetch } from '@/hooks/useFetch';
import { getMenus } from '@/api/menuApi';
import type { GetMenusQueryRequest } from '../../types';
import { menuKeys } from '../keys';

export function useMenus(params: GetMenusQueryRequest = {}) {
  return useFetch(
    menuKeys.list(params),
    () => getMenus(params)
  );
}
