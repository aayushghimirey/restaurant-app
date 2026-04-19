import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PremiumPaginationProps {
  page: number
  totalPages: number
  totalElements?: number
  itemLabel?: string
  onNext: () => void
  onPrev: () => void
}

export function PremiumPagination({
  page,
  totalPages,
  totalElements,
  itemLabel = "Records",
  onNext,
  onPrev
}: PremiumPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="border-t border-white/5 px-10 h-24 flex flex-col sm:flex-row items-center justify-between bg-white/[0.02] backdrop-blur-2xl gap-4 transition-all duration-500">
      <div className="text-[10px] uppercase tracking-[0.4em] font-black text-muted-foreground opacity-60 italic">
        Page {page + 1} of {totalPages}
        {totalElements !== undefined && (
          <>
            <span className="opacity-20 mx-4">/</span> Total {itemLabel}: {totalElements}
          </>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={page === 0}
          className="h-12 px-6 rounded-2xl disabled:opacity-20 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 border border-transparent hover:border-primary/20 uppercase font-black text-[9px] tracking-widest"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous Page
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          disabled={page >= totalPages - 1}
          className="h-12 px-6 rounded-2xl disabled:opacity-20 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 border border-transparent hover:border-primary/20 uppercase font-black text-[9px] tracking-widest"
        >
          Next Page <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
