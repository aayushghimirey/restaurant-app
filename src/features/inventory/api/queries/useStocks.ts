import { useFetch } from "@/hooks/useFetch"
import { getStocks } from "@/api/inventoryApi"
import type { GetStockQueryRequest } from "@/types/inventory"
import { stockKeys } from "../keys"

export function useStocks(params: GetStockQueryRequest = {}) {
  return useFetch(
    stockKeys.list(params),
    () => getStocks(params)
  )
}
