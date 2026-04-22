import * as React from "react"
import { Search, ChevronDown, Check, LayoutGrid, MapPin } from "lucide-react"
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

export interface TableOption {
  id: string
  name: string
  location: string
}

interface TableSelectorProps {
  options: TableOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function TableSelector({ 
  options, 
  value, 
  onChange, 
  disabled, 
  className, 
  placeholder = "Select table..." 
}: TableSelectorProps) {
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
    const baseOptions = [{ id: "all", name: "All Tables", location: "Anywhere" }, ...options]
    if (!search) return baseOptions
    const s = search.toLowerCase()
    return baseOptions.filter(opt => 
      opt.name.toLowerCase().includes(s) || 
      opt.location.toLowerCase().includes(s)
    )
  }, [options, search])

  const visibleOptions = React.useMemo(() => {
    return filteredOptions.slice(0, 50)
  }, [filteredOptions])

  const selectedOption = React.useMemo(() => {
    if (value === "all") return { id: "all", name: "All Tables", location: "" }
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
            "h-10 w-full bg-card border border-border rounded-xl px-4 flex items-center justify-between text-xs font-bold text-foreground transition-all disabled:opacity-50 hover:bg-muted font-sans shadow-sm",
            open && "ring-2 ring-primary/20 bg-muted",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
             {selectedOption ? (
                <>
                  <LayoutGrid className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{selectedOption.name}</span>
                </>
             ) : (
                <span className="text-muted-foreground truncate">{placeholder}</span>
             )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/10 shrink-0">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
             <LayoutGrid className="h-5 w-5 text-primary" /> Select Table
          </DialogTitle>
          <DialogDescription>
            Search and filter by table name or location.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b border-border/50 relative bg-background/50 shrink-0">
           <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
              autoFocus
              placeholder="Filter tables..."
              value={search}
              onChange={(e) => {
                 setSearch(e.target.value)
                 setFocusedIndex(0) 
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/50 font-bold text-foreground text-sm rounded-xl transition-all"
           />
        </div>

        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-muted/5">
           {visibleOptions.length === 0 ? (
              <div className="px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                 <LayoutGrid className="h-8 w-8 text-muted-foreground/20" />
                 <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No tables found</p>
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
                       "flex w-full items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 border border-transparent",
                       isFocused ? "bg-primary/5 text-primary border-primary/10" : "text-foreground hover:bg-muted/40",
                       isSelected && "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20"
                     )}
                   >
                      <div className="flex flex-col truncate pr-4">
                         <span className={cn("text-sm truncate uppercase tracking-tight", isFocused && "font-black")}>
                          {opt.name}
                         </span>
                         {opt.location && (
                           <div className="flex items-center gap-1 mt-0.5">
                             <MapPin className={cn("h-3 w-3", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")} />
                             <span className={cn("text-[10px] uppercase font-bold tracking-wider", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {opt.location}
                             </span>
                           </div>
                         )}
                      </div>
                      <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                         {isSelected && <Check className="h-4 w-4 animate-in zoom-in" />}
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
