import * as React from "react"
import { Search, ChevronDown, Check, User, Building2, Loader2 } from "lucide-react"
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
import { Vendor } from "../types"
import { useVendors } from "../api"

interface VendorSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function VendorSelector({ value, onChange, disabled, className, placeholder = "Search vendors..." }: VendorSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  
  // Cache the selected object so we can render its name even if not in current search results
  const [cachedSelection, setCachedSelection] = React.useState<Vendor | null>(null)

  // Debounce logic
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: vendorsResponse, isLoading } = useVendors({ 
    name: debouncedSearch, 
    size: 50 
  })
  
  const options = vendorsResponse?.data || []

  // Clear search and focus whenever the dialog is opened
  React.useEffect(() => {
    if (open) {
      setSearch("")
      setDebouncedSearch("")
      setFocusedIndex(0)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex(i => Math.min(i + 1, (options.length || 1) - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (options && options[focusedIndex]) {
        const opt = options[focusedIndex];
        setCachedSelection(opt);
        onChange(opt.id)
        setOpen(false)
      }
    }
  }

  // Determine what to show in the collapsed button
  // If the options array currently holds our value, use that, otherwise rely on the cached obj.
  const displayOption = options.find(o => o.id === value) || cachedSelection

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-10 w-full bg-card border border-border rounded-lg px-4 flex items-center justify-between text-xs font-medium text-foreground transition-all disabled:opacity-50 hover:bg-muted font-sans",
            open && "ring-1 ring-ring bg-muted",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
             {displayOption ? (
               <>
                 <User className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="truncate font-semibold">{displayOption.name}</span>
               </>
             ) : (
               <span className="text-muted-foreground truncate">{placeholder}</span>
             )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>

      {/* Central Modal for Selection */}
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/50 shadow-2xl">
        <DialogHeader className="px-5 py-4 border-b border-border/50 bg-muted/10 shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-foreground normal-case tracking-normal">
             <Building2 className="h-5 w-5 text-primary" /> Select Vendor
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground normal-case tracking-normal">
            Search authorized vendors by querying the server directly.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 border-b border-border/50 relative bg-background/50 shrink-0">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
              autoFocus
              placeholder="Type vendor name (server search)..."
              value={search}
              onChange={(e) => {
                 setSearch(e.target.value)
                 setFocusedIndex(0) 
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 placeholder:text-muted-foreground/50 font-medium text-foreground text-sm rounded-xl transition-all pr-12"
           />
           {isLoading && (
             <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
           )}
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-muted/5">
           {options.length === 0 && !isLoading ? (
              <div className="px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                 <Building2 className="h-8 w-8 text-muted-foreground/30" />
                 <p className="text-sm font-medium text-muted-foreground">No vendor found</p>
                 <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                   Try adjusting your search criteria or register a new one.
                 </p>
              </div>
            ) : (
              options.map((opt, i) => {
                 const isSelected = opt.id === value
                 const isFocused = i === focusedIndex

                 return (
                   <button
                     key={opt.id}
                     type="button"
                     onClick={() => {
                       setCachedSelection(opt)
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
                          {opt.name}
                         </span>
                         <span className="text-xs text-muted-foreground flex gap-3 truncate">
                          {opt.panNumber && <span>PAN: <span className="font-semibold text-foreground/80">{opt.panNumber}</span></span>}
                          {opt.contactNumber && <span>Tel: <span className="font-semibold text-foreground/80">{opt.contactNumber}</span></span>}
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
      </DialogContent>
    </Dialog>
  )
}
