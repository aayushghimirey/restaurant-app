import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/input"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"
import type { GetStockQueryRequest, StockResponse, StockType } from "@/types/inventory"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Package,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  X
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStocks } from "../api"
import { StockForm } from "./StockForm"

// ─── Stock Type Badge ──────────────────────────────────────────────────────────

function StockTypeBadge({ type }: { type: string }) {
  const typeMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
    BEVERAGE: { label: "BEVERAGE", variant: "info" },
    FOOD: { label: "FOOD", variant: "success" },
    OTHER: { label: "OTHER", variant: "warning" },
  }

  const { label, variant } = typeMap[type] || { label: type, variant: "default" }
  return <StatusBadge status={label} variant={variant as any} />
}

// ─── Expanded Variant Panel ────────────────────────────────────────────────────

interface VariantPanelProps {
  stock: StockResponse
  onViewHistory: (variantId: string) => void
}

function VariantPanel({ stock, onViewHistory }: VariantPanelProps) {
  return (
    <div className="px-5 py-5 bg-muted/20 border-t border-border">
      <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-4">
        Variants &amp; Stock
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stock.variants?.map((v) => (
          <div
            key={v.id ?? v.name}
            className="rounded-lg border border-border bg-card p-4 space-y-3"
          >
            {/* Variant header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground leading-tight">{v.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Base: {v.baseUnit}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => onViewHistory(v.id || "")}
                title="View transaction history"
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Stock figures */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-md px-3 py-2">
                <p className="text-[10px] text-muted-foreground mb-0.5">Opening</p>
                <p className="text-sm font-semibold text-foreground">{Number(v.openingStock)}</p>
              </div>
              <div className="bg-primary/10 rounded-md px-3 py-2 border border-primary/20">
                <p className="text-[10px] text-primary/70 mb-0.5">Balance</p>
                <p className="text-sm font-semibold text-foreground">{Number(v.currentStock)}</p>
              </div>
            </div>

            {/* Conversion rates */}
            {v.units && v.units.length > 0 && (
              <div className="border-t border-border pt-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Conversion Matrix
                </p>
                {v.units.map((u) => (
                  <div
                    key={u.id ?? u.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          u.unitType === "SELL" ? "bg-emerald-500" : "bg-primary"
                        )}
                      />
                      {u.name}
                    </div>
                    <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      1 : {Number(u.conversionRate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Table Row ─────────────────────────────────────────────────────────────────

interface StockTableRowProps {
  stock: StockResponse
  isExpanded: boolean
  onToggle: (id: string) => void
  onViewHistory: (variantId: string) => void
  onEdit: () => void
}

function StockTableRow({ stock, isExpanded, onToggle, onViewHistory, onEdit }: StockTableRowProps) {
  return (
    <>
      <tr
        className={cn(
          "hover:bg-muted/30 transition-colors cursor-pointer",
          isExpanded && "bg-muted/20"
        )}
        onClick={() => onToggle(stock.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle(stock.id)
        }}
      >
        {/* Item */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-tight">{stock.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {stock.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="px-5 py-4">
          <StockTypeBadge type={stock.type} />
        </td>

        {/* Variants summary */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {stock.variants?.slice(0, 3).map((v) => (
              <span
                key={v.id ?? v.name}
                className="inline-flex items-center gap-1 text-xs bg-muted border border-border px-2 py-0.5 rounded-md font-mono"
              >
                <span className="text-foreground font-medium">{Number(v.currentStock)}</span>
                <span className="text-muted-foreground">{v.baseUnit}</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground">{v.name}</span>
              </span>
            ))}
            {(stock.variants?.length ?? 0) > 3 && (
              <span className="text-xs text-muted-foreground">
                +{(stock.variants?.length ?? 0) - 3} more
              </span>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span>{isExpanded ? "Hide" : "Details"}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180 text-primary"
                )}
              />
            </div>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={4} className="p-0 border-none">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <VariantPanel stock={stock} onViewHistory={onViewHistory} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function InventoryList() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedType, setSelectedType] =
    useState<StockType | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingStock, setEditingStock] = useState<StockResponse | null>(null)
  const navigate = useNavigate()

  const size = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(0)
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const queryParams = useMemo(() => ({
    name: debouncedSearch.trim() ? debouncedSearch : undefined,
    type: selectedType === "ALL" ? undefined : selectedType,
    page,
    size,
  }), [debouncedSearch, selectedType, page, size])

  const { data: stocks, isLoading, error } = useStocks(queryParams)

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleViewVariantHistory = (variantId: string) => {
    navigate(`/inventory/transactions/${variantId}`)
  }

  const totalElements = stocks?.totalElements ?? 0
  const totalPages = stocks?.totalPages ?? 0

  return (
    <div className="min-h-screen p-6 md:p-8 animate-in max-w-[1200px] mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {totalElements} items
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your stock levels, variants, and conversion units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64 group">
            {isLoading && debouncedSearch !== searchQuery ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            )}
            <Input
              placeholder="Search by stock name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              className="pl-9 pr-9 h-10 rounded-lg text-sm bg-muted/50 border-border focus:bg-background transition-all placeholder:text-muted-foreground/70"
              aria-label="Search inventory"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setPage(0)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-full p-0.5 hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as StockType | "ALL")
                setPage(0)
              }}
              className="h-10 pl-9 pr-8 bg-muted/50 border border-border rounded-lg text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="ALL">All types</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="FOOD">Food</option>
              <option value="OTHER">Other</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Add dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 gap-2 text-sm font-medium rounded-lg">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl h-[88vh] flex flex-col overflow-hidden p-0 gap-0">
              <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
                <DialogTitle className="text-base font-semibold">Add Inventory Item</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Configure asset details, variants, and unit conversion matrix.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <StockForm
                  mode="create"
                  onCancel={() => setIsOpen(false)}
                  onSuccess={() => setIsOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load inventory"
          description="Unable to reach the catalog. Check your connection and try again."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Item</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Variants</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stocks?.data.map((stock: StockResponse) => (
                  <StockTableRow
                    key={stock.id}
                    stock={stock}
                    isExpanded={expandedId === stock.id}
                    onToggle={toggleExpanded}
                    onViewHistory={handleViewVariantHistory}
                    onEdit={() => setEditingStock(stock)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingStock}
            onOpenChange={(open) => !open && setEditingStock(null)}
          >
            <DialogContent className="sm:max-w-5xl h-[88vh] flex flex-col overflow-hidden p-0 gap-0">
              <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
                <DialogTitle className="text-base font-semibold">Edit Inventory Item</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update specifications and units for{" "}
                  <span className="font-medium text-foreground">{editingStock?.name}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                {editingStock && (
                  <StockForm
                    mode="edit"
                    stockId={editingStock.id}
                    defaultValues={editingStock}
                    onCancel={() => setEditingStock(null)}
                    onSuccess={() => setEditingStock(null)}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {(!stocks || stocks.data.length === 0) && (
            <EmptyState
              icon={Boxes}
              title="No items found"
              description="Adjust your search or category filter to locate your inventory."
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Showing page{" "}
                <span className="font-semibold text-foreground">{page + 1}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}