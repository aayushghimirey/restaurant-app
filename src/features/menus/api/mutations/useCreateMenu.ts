import { useMutation } from '@/hooks/useMutation';
import { createMenu } from '@/api/menuApi';
import type { CreateMenuRequest } from '../../types';
import { menuKeys } from '../keys';
import { invalidateKey } from '@/lib/eventBus';

export function useCreateMenu() {
  return useMutation({
    mutationFn: (payload: CreateMenuRequest) => createMenu(payload),
    onSuccess: () => {
      invalidateKey(menuKeys.lists());
    },
  });
}
