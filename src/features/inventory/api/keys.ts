import type { GetStockQueryRequest, GetStockTransactionsQueryRequest } from '@/types/inventory';

export const stockKeys = {
  all: ["stocks"] as const,
  lists: () => [...stockKeys.all, "list"] as const,
  list: (params: GetStockQueryRequest) => [...stockKeys.lists(), params] as const,
  detail: (id: string) => [...stockKeys.all, "detail", id] as const,
  variants: (id: string) => [...stockKeys.detail(id), "variants"] as const,
  transactions: (params: GetStockTransactionsQueryRequest) => [...stockKeys.all, "transactions", params] as const,
  variantTransactions: (vId: string, params: GetStockTransactionsQueryRequest) => [...stockKeys.all, "variant-transactions", vId, params] as const,
}
