import { useState, useMemo } from "react";
import { Search, X, User, ChevronRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface VendorOption {
  id: string;
  name: string;
  address?: string;
  contactNumber?: string;
}

interface VendorSelectorProps {
  options: VendorOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VendorSelector({ options, value, onChange, placeholder = "Select Vendor" }: VendorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedVendor = useMemo(() => 
    options.find(v => v.id === value), 
  [options, value]);

  const filteredOptions = useMemo(() => {
    const s = search.toLowerCase();
    return options.filter(v => 
      v.name.toLowerCase().includes(s) || 
      v.address?.toLowerCase().includes(s) ||
      v.contactNumber?.toLowerCase().includes(s)
    );
  }, [options, search]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-10 px-4 rounded-xl border-border bg-card flex items-center justify-between group hover:border-primary/50 transition-all",
            !selectedVendor && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <User className={cn("h-3.5 w-3.5 shrink-0 transition-colors", selectedVendor ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-bold truncate">
              {selectedVendor ? selectedVendor.name : placeholder}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {value && value !== "all" && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("all");
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            <div className="h-4 w-[1px] bg-border mx-1" />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden bg-background border-border shadow-2xl rounded-[1.5rem]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold tracking-tight">Select Vendor</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, address or contact..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-muted/30 border-border font-medium"
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar mt-2">
          <div className="space-y-1">
            <button
              onClick={() => handleSelect("all")}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group",
                value === "all" ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border transition-all", 
                value === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border group-hover:bg-background"
              )}>
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className={cn("text-sm font-bold", value === "all" ? "text-primary" : "text-foreground")}>All Vendors</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Show purchases from all vendors</p>
              </div>
            </button>

            {filteredOptions.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => handleSelect(vendor.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group",
                  value === vendor.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border transition-all", 
                   value === vendor.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border group-hover:bg-background"
                )}>
                  <div className="text-[10px] font-black uppercase">{vendor.name.substring(0, 2)}</div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={cn("text-sm font-bold truncate", value === vendor.id ? "text-primary" : "text-foreground")}>{vendor.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    {vendor.contactNumber || "No contact"} • {vendor.address || "No address"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {filteredOptions.length === 0 && search && (
            <div className="py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">No vendors found matching "{search}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
