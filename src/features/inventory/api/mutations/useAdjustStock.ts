import { useMutation } from "@/hooks/useMutation"
import { adjustStock } from "@/api/inventoryApi"
import type { StockAdjustmentCommand } from "@/types/inventory"
import { stockKeys } from "../keys"
import { invalidateKey } from "@/lib/eventBus"

export function useAdjustStock() {
  return useMutation({
    mutationFn: (command: StockAdjustmentCommand) => adjustStock(command),
    onSuccess: () => {
      invalidateKey(stockKeys.lists())
      invalidateKey(stockKeys.transactions({})[0] as string) // Just a fallback approximation
    },
  })
}
