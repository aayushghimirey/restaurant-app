import * as React from "react"
import { 
  Plus, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UtensilsCrossed,
  Pencil
} from "lucide-react"
import { useMenus } from "../api"
import type { MenuResponse } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SkeletonCard } from "@/components/ui/SkeletonCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { MenuForm } from "./MenuForm"

function MenuCategoryBadge({ category }: { category: string }) {
  const catMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
    APPETIZER: { label: "APPETIZER", variant: "warning" },
    MAIN_COURSE: { label: "MAIN COURSE", variant: "success" },
    DESSERT: { label: "DESSERT", variant: "info" },
    BEVERAGE: { label: "BEVERAGE", variant: "info" },
    OTHER: { label: "OTHER", variant: "default" },
  }

  const { label, variant } = catMap[category.toUpperCase()] || { label: category, variant: "default" }
  return <StatusBadge status={label} variant={variant as any} />
}

export default function MenusPage() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL")
  const [page, setPage] = React.useState(0)

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(0)
    }, 450)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data: menusData, isLoading, error } = useMenus({
    page: page,
    size: 25,
  })

  // Local fallback filtering 
  const menus = React.useMemo(() => {
    if (!!error || !menusData?.data) return []
    let filtered = menusData.data

    if (selectedCategory !== "ALL") {
       filtered = filtered.filter(m => m.category.toUpperCase() === selectedCategory)
    }

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(s) || 
        m.code?.toLowerCase().includes(s)
      )
    }
    return filtered
  }, [menusData, debouncedSearch, selectedCategory])

  const totalElements = menusData?.totalElements || 0
  const totalPages = menusData?.totalPages || 0

  return (
    <div className="min-h-screen p-6 md:p-8 animate-in max-w-[1200px] mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Menus</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {totalElements} items
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your point of sale items and recipes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              className="pl-9 h-10 rounded-lg text-sm bg-muted/50 border-border focus:bg-background transition-all"
              aria-label="Search catalog"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(0)
              }}
              className="h-10 pl-9 pr-8 bg-muted/50 border border-border rounded-lg text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              <option value="APPETIZER">Appetizer</option>
              <option value="MAIN_COURSE">Main Course</option>
              <option value="DESSERT">Dessert</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="OTHER">Other</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 gap-2 text-sm font-medium rounded-lg">
                <Plus className="h-4 w-4" />
                Add menu item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl overflow-hidden p-0 gap-0">
              <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
                <DialogTitle className="text-base font-semibold">Create Menu Item</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Create a new configurable menu item to be sold via point of sale. 
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar max-h-[80vh]">
                <MenuForm
                   onCancel={() => setIsOpen(false)}
                   onSuccess={() => setIsOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Main content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !!error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load menus"
          description="Unable to fetch menu items from server. Check your connection or try again."
        />
      ) : menus.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items found"
          description="You haven't defined any menu items yet, or none match your filter."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Item Identity</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Pricing</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Recipe Elements</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {menus.map((menu: MenuResponse) => (
                  <tr key={menu.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                       <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                             <UtensilsCrossed className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">{menu.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {menu.code || menu.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                       </div>
                    </td>
                    <td className="px-5 py-4">
                       <MenuCategoryBadge category={menu.category} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="text-[11px] font-bold text-muted-foreground">Nrs</span>
                        <span>{menu.price.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {menu.ingredients?.length ? (
                           <span className="inline-flex items-center gap-1.5 text-xs text-foreground bg-muted px-2 py-1 rounded-md border border-border font-medium">
                             <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                             {menu.ingredients.length} elements mapped
                           </span>
                        ) : (
                           <span className="text-xs text-muted-foreground italic">None (Standalone)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div className="flex items-center justify-end">
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground"
                           title="Configure Menu Item"
                         >
                           <Pencil className="h-4 w-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Minimal Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{page + 1}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
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
