import { useFetch } from '@/hooks/useFetch';
import { getMenuIngredientsById } from '@/api/menuApi';
import { menuKeys } from '../keys';

export function useMenuIngredients(id: string) {
  return useFetch(
    menuKeys.ingredients(id),
    () => getMenuIngredientsById(id),
    { enabled: !!id }
  );
}
