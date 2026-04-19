import { useFetch } from '@/hooks/useFetch';
import { getMenuById } from '@/api/menuApi';
import { menuKeys } from '../keys';

export function useMenuDetails(id: string) {
  return useFetch(
    menuKeys.detail(id), 
    () => getMenuById(id),
    { enabled: !!id }
  );
}
