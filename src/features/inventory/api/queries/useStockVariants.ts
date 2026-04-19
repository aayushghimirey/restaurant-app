import { useFetch } from "@/hooks/useFetch"
import { getStockVariants } from "@/api/inventoryApi"
import type { GetStockVariantsQueryRequest } from "@/types/inventory"
import { stockKeys } from "../keys"

export function useStockVariants(id: string, params: GetStockVariantsQueryRequest = {}) {
  return useFetch(
    stockKeys.variants(id),
    () => getStockVariants(id, params),
    { enabled: !!id }
  )
}
