import * as React from "react"
import {
  RefreshCcw,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  ChevronLeft,
  Filter,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStockTransactions, useVariantTransactions, useStocks } from "../api"
import { useParams, useNavigate } from "react-router-dom"
import { VariantSelector } from "./VariantSelector"
import { StockTransactionResponse } from "@/types/inventory"



export default function InventoryTransactionsPage() {
  const [page, setPage] = React.useState(0)
  const { variantId } = useParams()
  const navigate = useNavigate()

  // Fetch stocks to populate variant filter
  const { data: stocksData } = useStocks({ size: 100 })
  const allVariants = React.useMemo(() => {
    if (!stocksData?.data) return []
    return stocksData.data.flatMap(s => 
      (s.variants || [])
        .filter(v => !!v.id)
        .map(v => ({ 
          id: v.id!, 
          name: v.name, 
          stockName: s.name 
        }))
    )
  }, [stocksData])

  const queryParams = {
    size: 25,
    page
  }

  const globalTransactions = useStockTransactions(queryParams)
  const variantTransactions = useVariantTransactions(variantId || "", queryParams)

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch
  } = variantId ? variantTransactions : globalTransactions

  const transactions: StockTransactionResponse[] = transactionsData?.data || []

  const handleVariantChange = (id: string) => {
    if (!id || id === "all") {
      navigate("/inventory/transactions")
    } else {
      navigate(`/inventory/transactions/${id}`)
    }
    setPage(0)
  }

  const getTxMeta = (tx: StockTransactionResponse) => {
    const type = tx.referenceType?.toUpperCase()

    if (type === "PURCHASE") {
      return {
        color: "emerald",
        icon: TrendingUp,
        sign: "+"
      }
    }

    if (type === "SALES" || type === "SALE") {
      return {
        color: "rose",
        icon: TrendingDown,
        sign: "-"
      }
    }

    return {
      color: "amber",
      icon: ArrowUpRight,
      sign: tx.quantityChanged > 0 ? "+" : ""
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-8 animate-in max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="h-8 w-8 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Stock History</h1>
            {variantId && transactionsData?.data?.[0] && (
              <p className="text-xs text-muted-foreground">
                Filtering by: <span className="font-medium text-foreground">{transactionsData.data[0].variantName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Variant Filter Selector */}
          <VariantSelector
            options={allVariants}
            value={variantId || "all"}
            onChange={handleVariantChange}
            placeholder="Search variant..."
            className="min-w-[220px]"
          />

          <Button size="sm" variant="outline" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export History</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-3 text-left font-medium text-[11px] uppercase tracking-wider">Time</th>
                <th className="px-5 py-3 text-left font-medium text-[11px] uppercase tracking-wider">Product Variant</th>
                <th className="px-5 py-3 text-left font-medium text-[11px] uppercase tracking-wider">Log Type</th>
                <th className="px-5 py-3 text-center font-medium text-[11px] uppercase tracking-wider">Movement</th>
                <th className="px-5 py-3 text-right font-medium text-[11px] uppercase tracking-wider">Closing Balance</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                      <span className="text-xs text-muted-foreground">Syncing audit entries...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-xs text-destructive/80 font-medium">Failed to reach the audit server.</p>
                      <Button size="sm" variant="outline" onClick={refetch}>Retry Connection</Button>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Clock className="h-8 w-8" />
                      <span className="text-xs">No movements found locally.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const meta = getTxMeta(tx)
                  const Icon = meta.icon

                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                      </td>

                      {/* Variant */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground text-sm tracking-tight">{tx.variantName}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                              {tx.unitName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-foreground/70">
                          {tx.referenceType || "ADJUSTMENT"}
                        </span>
                        {tx.remark && (
                          <p className="text-[10px] text-muted-foreground/60 truncate max-w-[150px] mt-0.5">{tx.remark}</p>
                        )}
                      </td>

                      {/* Change */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border tabular-nums shadow-sm transition-all",
                              meta.color === "emerald" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                              meta.color === "rose" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                              meta.color === "amber" && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {meta.sign}{Math.abs(tx.quantityChanged)}
                          </span>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-block bg-muted/40 border border-border/50 px-2.5 py-1 rounded-md">
                          <span className="text-sm font-bold font-mono tracking-tighter text-foreground">
                            {Number(tx.balanceAfter).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 border-t bg-muted/10 gap-4">
          <div className="text-[11px] text-muted-foreground font-medium">
            Showing audit trail for <span className="text-foreground">{transactionsData?.totalElements ?? 0}</span> operations
            · Page {page + 1} of {transactionsData?.totalPages ?? 1}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-xs bg-background shadow-sm px-4"
              disabled={page === 0 || isLoading}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-xs bg-background shadow-sm px-4"
              disabled={
                isLoading ||
                (transactionsData?.totalPages
                  ? page >= transactionsData.totalPages - 1
                  : true)
              }
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}