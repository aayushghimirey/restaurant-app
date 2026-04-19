import { useFetch } from "@/hooks/useFetch"
import { getStockTransactions } from "@/api/inventoryApi"
import type { GetStockTransactionsQueryRequest } from "@/types/inventory"
import { stockKeys } from "../keys"

export function useStockTransactions(params: GetStockTransactionsQueryRequest = {}) {
  return useFetch(
    stockKeys.transactions(params),
    () => getStockTransactions(params)
  )
}
