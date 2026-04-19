import { useMutation } from "@/hooks/useMutation"
import { updateStock } from "@/api/inventoryApi"
import type { StockUpdateCommand } from "@/types/inventory"
import { stockKeys } from "../keys"
import { invalidateKey } from "@/lib/eventBus"

export function useUpdateStock() {
  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: StockUpdateCommand }) =>
      updateStock(id, command),
    onSuccess: (_, variables) => {
      invalidateKey(stockKeys.lists())
      invalidateKey(stockKeys.detail(variables.id))
    },
  })
}
