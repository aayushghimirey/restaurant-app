import { useMutation } from "@/hooks/useMutation"
import { createStock } from "@/api/inventoryApi"
import type { StockReqDto } from "@/types/inventory"
import { stockKeys } from "../keys"
import { invalidateKey } from "@/lib/eventBus"

export function useCreateStock() {
  return useMutation({
    mutationFn: (payload: StockReqDto) => createStock(payload),
    onSuccess: () => {
      invalidateKey(stockKeys.lists())
    },
  })
}
