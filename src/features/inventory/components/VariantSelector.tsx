import * as React from "react"
import { Search, ChevronDown, Check, Package, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/Dialog"

export interface VariantOption {
  id: string
  stockName: string
  name: string
  units?: any[]
}

interface VariantSelectorProps {
  options: VariantOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function VariantSelector({ options, value, onChange, disabled, className, placeholder = "Search assets..." }: VariantSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [focusedIndex, setFocusedIndex] = React.useState(0)

  // Clear search and focus whenever the dialog is opened
  React.useEffect(() => {
    if (open) {
      setSearch("")
      setFocusedIndex(0)
    }
  }, [open])

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const s = search.toLowerCase()
    return options.filter(opt => 
      opt.stockName.toLowerCase().includes(s) || 
      opt.name.toLowerCase().includes(s)
    )
  }, [options, search])

  const visibleOptions = React.useMemo(() => {
    return filteredOptions.slice(0, 50)
  }, [filteredOptions])

  const selectedOption = React.useMemo(() => {
    return options.find(o => o.id === value)
  }, [options, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex(i => Math.min(i + 1, (visibleOptions.length || 1) - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (visibleOptions && visibleOptions[focusedIndex]) {
        onChange(visibleOptions[focusedIndex].id)
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-10 w-full bg-muted/50 border border-border rounded-lg px-4 flex items-center justify-between text-xs font-medium text-foreground transition-all disabled:opacity-50 hover:bg-muted font-sans",
            open && "ring-1 ring-ring bg-muted",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
             {selectedOption ? (
               <>
                 <Database className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="truncate">{selectedOption.stockName} - {selectedOption.name}</span>
               </>
             ) : (
               <span className="text-muted-foreground truncate">{placeholder}</span>
             )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>

      {/* Central Modal for Variant Selection */}
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/50 shadow-2xl">
        <DialogHeader className="px-5 py-4 border-b border-border/50 bg-muted/10 shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-foreground normal-case tracking-normal">
             <Package className="h-5 w-5 text-primary" /> Select Inventory Asset
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground normal-case tracking-normal">
            Search from your catalog of stock and variants.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 border-b border-border/50 relative bg-background/50 shrink-0">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
              autoFocus
              placeholder="Type stock name, variant, or SKU..."
              value={search}
              onChange={(e) => {
                 setSearch(e.target.value)
                 setFocusedIndex(0) 
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 placeholder:text-muted-foreground/50 font-medium text-foreground text-sm rounded-xl transition-all"
           />
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-muted/5">
           {visibleOptions.length === 0 ? (
              <div className="px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                 <Database className="h-8 w-8 text-muted-foreground/30" />
                 <p className="text-sm font-medium text-muted-foreground">No assets found</p>
                 <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                   Adjust your search query or ensure the inventory item is created.
                 </p>
              </div>
            ) : (
              visibleOptions.map((opt, i) => {
                 const isSelected = opt.id === value
                 const isFocused = i === focusedIndex

                 return (
                   <button
                     key={opt.id}
                     type="button"
                     onClick={() => {
                       onChange(opt.id)
                       setOpen(false)
                     }}
                     onMouseEnter={() => setFocusedIndex(i)}
                     className={cn(
                       "flex w-full items-center justify-between px-3 py-3 rounded-xl text-left transition-all duration-200 border border-transparent",
                       isFocused ? "bg-accent/80 text-accent-foreground border-border/50 shadow-sm" : "text-foreground hover:bg-muted/40",
                       isSelected && "bg-primary/10 border-primary/20 text-primary font-bold"
                     )}
                   >
                      <div className="flex flex-col truncate pr-4">
                         <span className={cn("text-sm truncate", isFocused && "font-semibold")}>
                          {opt.stockName}
                         </span>
                         <span className="text-xs text-muted-foreground truncate">
                          Variant: <span className="font-semibold text-foreground/80">{opt.name}</span>
                         </span>
                      </div>
                      <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                         {isSelected && <Check className="h-4 w-4 text-primary animate-in zoom-in" />}
                      </div>
                   </button>
                 )
              })
           )}
        </div>
        
        {filteredOptions.length > 50 && (
           <div className="px-4 py-3 border-t border-border/50 bg-muted/10 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" />
              Showing top 50 of {filteredOptions.length} results. Keep typing to refine.
           </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
