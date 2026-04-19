import { useFetch } from "@/hooks/useFetch"
import { getVariantTransactions } from "@/api/inventoryApi"
import type { GetStockTransactionsQueryRequest } from "@/types/inventory"
import { stockKeys } from "../keys"

export function useVariantTransactions(variantId: string, params: GetStockTransactionsQueryRequest = {}) {
  return useFetch(
    stockKeys.variantTransactions(variantId, params),
    () => getVariantTransactions(variantId, params),
    { enabled: !!variantId }
  )
}
